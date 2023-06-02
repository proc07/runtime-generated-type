import fs from 'fs/promises'
import type { HttpProxy } from 'vite'
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
const CACHE_REG: { [url: string]: RegExp } = {}
function cacheBaseUrlReg(baseUrl: string) {
  if (!CACHE_REG[baseUrl])
    CACHE_REG[baseUrl] = new RegExp(`.*${baseUrl.replaceAll('/*', '/([^/]*)')}`)

  return CACHE_REG[baseUrl]
}
function stringConvertToRegExp(matching: Array<string>) {
  // todo: cache
  return matching.map(matchString => new RegExp(`${matchString.replace('*', '([^/]*)')}$`))
}

export function extractPathName(fullPathname: string, { baseUrl = '', matching = [] }: Omit<UserOptions, 'outputPath'>) {
  const RegExpBaseUrl = cacheBaseUrlReg(baseUrl)
  const pathname = fullPathname.replace(RegExpBaseUrl, '')
  let pathSplitList = pathname.split('/')

  stringConvertToRegExp(matching).some((regex: RegExp) => {
    const result = regex.exec(pathname)
    if (result) {
      pathSplitList = pathSplitList.filter(item => item !== result[1])
      return result
    }
    else {
      return false
    }
  })

  return pathSplitList.filter(item => item && !checkParamId(item))
    .map(item => toFirstUpperCase(item)).join('')
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
interface UserOptions {
  baseUrl: string
  outputPath: string
  dataSource?: string
  genOnce?: boolean
  matching?: Array<string>
  prefix?: boolean
}
export function createRuntimeGeneratedType(userOptions: UserOptions) {
  const { outputPath, dataSource = '', genOnce = false, prefix = false } = userOptions

  return function (proxy: HttpProxy.Server) {
    proxy.on('proxyRes', async (proxyRes, req) => {
      const method = req.method || ''
      const { pathname } = new URL(req.url as string, `http://${req.headers.host}`)

      if (!validateStatus(proxyRes.statusCode!)) {
        console.error(`${proxyRes.statusCode}: ${pathname}`)
        console.error('statusCode >= 200 && statusCode < 300 To generate parameter types.')
        return
      }

      const pathNameStr = extractPathName(pathname, userOptions)
      const typeName = `${prefix ? toFirstUpperCase(method.toLowerCase()) : ''}${pathNameStr}ResType`
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
          const resData: unknown = dataSource.length ? dataSource.split('.').reduce((data, i) => data[i], responseData) : responseData
          const ast = createTypeAst(resData)

          if (ast) {
            baseParse(resData, ast)

            const { exportCode, typeCode } = generate(ast, {
              typeName,
            })

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
