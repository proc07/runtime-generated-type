import fs from 'fs/promises'
import type { HttpProxy, ProxyOptions } from 'vite'
import chalk from 'chalk'
import { baseParse, createTypeAst } from './compile/parse'
import { generate } from './compile/codegen'
import { isAllNumbers, isUUID, toFirstUpperCase } from './utils/util'
import decompress from './utils/decompress'

let fileProcessing = false
const taskQueue: Array<Function> = []
const RegexAnnotation = /\/\*\*([\s\S]*?)\*\//g
const RegexExport = /(export\s+(type|interface)\s+([a-zA-Z0-9_]+)\s+=\s+)(?:(?!type|interface).)+>/s

function validateStatus(status: number) {
  return status >= 200 && status < 300
}
function checkParamId(params: string) {
  return isAllNumbers(params) || isUUID(params)
}

interface GenAnnotationProps {
  url: string
  method: string
  typeName: string
}
function generateAnnotation({
  url,
  method,
  typeName,
}: GenAnnotationProps) {
  return `/**
 * Request URL: ${url}
 * 
 * Request Method: ${method}
 * 
 * @typeName ${typeName}
 */`
}

interface userOptions {
  outputPath: string
  dataSource?: string
  baseUrl?: string
  genOnce?: boolean
}
export function createRuntimeGeneratedType({ outputPath, dataSource = '', baseUrl = '', genOnce = false }: userOptions) {
  const RegExpUrl = baseUrl.replaceAll('/*', '/([^/]*)')

  return function (proxy: HttpProxy.Server, options: ProxyOptions) {
    proxy.on('proxyRes', async (proxyRes, req, res) => {
      const method = req.method || ''
      const { pathname } = new URL(req.url as string, `http://${req.headers.host}`)
      const pathSplitList = pathname.replace(new RegExp(`.*${RegExpUrl}`), '').split('/')
      const firstPathItem = toFirstUpperCase(pathSplitList[0])
      let pathNameStr = ''

      if (pathSplitList.length === 1 || (pathSplitList.length === 2 && checkParamId(pathSplitList[1]))) {
        pathNameStr = firstPathItem
      }
      else {
        const lastParam = pathSplitList[pathSplitList.length - 1]
        if (checkParamId(lastParam))
          pathNameStr = firstPathItem + toFirstUpperCase(pathSplitList[pathSplitList.length - 2])
        else
          pathNameStr = firstPathItem + toFirstUpperCase(lastParam)
      }

      const typeName = `${toFirstUpperCase(method.toLowerCase())}${pathNameStr}ResType`
      const annotationTypeName = `@typeName ${typeName}`

      // decompress proxy response
      const _proxyRes = decompress(proxyRes, proxyRes.headers['content-encoding'])

      let buffer = Buffer.from('', 'utf8')
      // concat data stream
      _proxyRes.on('data', chunk => (buffer = Buffer.concat([buffer, chunk])))
      _proxyRes.on('end', async () => {
        if (genOnce) {
          try {
            const res = await fs.readFile(outputPath)
            if (res.toString().includes(annotationTypeName)) {
              console.log(chalk.redBright(`Parameter type name ${typeName} already exists`))
              return
            }
          }
          catch (error) {}
        }

        try {
          const responseString = buffer.toString()
          const responseData = JSON.parse(responseString)
          const resData = dataSource.length ? dataSource.split('.').reduce((data, i) => data[i], responseData) : responseData

          if (resData) {
            const ast = createTypeAst(resData)
            baseParse(resData, ast)
            // console.log('baseParse:', JSON.stringify(ast, null, 2))
            const { exportCode, typeCode } = generate(ast, {
              typeName,
            })
            // console.log(code)
            const annotationCode = generateAnnotation({
              url: pathname,
              method,
              typeName,
            })

            async function writeTypeCodeToFile() {
              if (fileProcessing) {
                taskQueue.push(writeTypeCodeToFile)
                return
              }
              fileProcessing = true

              try {
                const res = await fs.readFile(outputPath)
                const fileData = res.toString()

                if (!fileData.includes(annotationTypeName)) {
                  console.log(chalk.green(`Have added: ${typeName}`))
                  const newData = `${fileData}\n\n${annotationCode}\n${exportCode}`

                  await fs.writeFile(outputPath, newData)
                }
                else if (fileData.includes(exportCode) || fileData.includes(typeCode)) {
                  console.log(chalk.blue(`No change: ${typeName}`))
                }
                else {
                  if (validateStatus(proxyRes.statusCode || -1)) {
                    console.log(chalk.red(`Have changes: ${typeName}`))

                    const matches = fileData.match(RegexAnnotation)
                    const filteredMatches = matches!.filter(match => match.includes(annotationTypeName))
                    const prevAnnotation = filteredMatches.join('')
                    const prevAnnotationIdx = fileData.indexOf(prevAnnotation)

                    // Matches the first export
                    const exportMatches = fileData.slice(prevAnnotationIdx + prevAnnotation.length).match(RegexExport)

                    // replace type code
                    if (exportMatches) {
                      const newData = fileData.replace(exportMatches[0], exportMatches[1] + typeCode)
                      await fs.writeFile(outputPath, newData)
                    }
                  }
                  else {
                    console.error(`${proxyRes.statusCode}: ${pathname}`)
                    console.error('statusCode >= 200 && statusCode < 300 To generate parameter types.')
                  }
                }
              }
              catch (error) {
                console.log(chalk.green(`Create File: ${outputPath}`))
                await fs.writeFile(outputPath, `${annotationCode}\n${exportCode}`)
              }
              fileProcessing = false

              const nextTask = taskQueue.shift()
              nextTask && nextTask()
            }

            await writeTypeCodeToFile()
          }
          else {
            // get error interface
          }
        }
        catch (error: any) {
          console.error('runtime-generated-type:', error.toString())
        }
      })
    })
  }
}
