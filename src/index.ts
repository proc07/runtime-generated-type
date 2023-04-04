import fs from 'fs/promises'
import type { HttpProxy, ProxyOptions } from 'vite'
import chalk from 'chalk'
import { baseParse, createTypeAst } from './compile/parse'
import { generate } from './compile/codegen'
import { detectionTypName, toFirstUpperCase } from './utils/util'
import decompress from './utils/decompress'

interface userOptions {
  outputPath: string
  dataSource?: string
  genOnce?: boolean
}

function validateStatus(status: number) {
  return status >= 200 && status < 300
}

export function createRuntimeGeneratedType({ outputPath, dataSource = '', genOnce = false }: userOptions) {
  return function (proxy: HttpProxy.Server, options: ProxyOptions) {
    // proxy 是 'http-proxy' 的实例
    proxy.on('proxyRes', async (proxyRes, req, res) => {
      const { pathname } = new URL(req.url as string, `http://${req.headers.host}`)
      const pathnameSplitList = pathname.split('/')
      const method = req.method || ''
      const typeName = `${toFirstUpperCase(method.toLowerCase())}${toFirstUpperCase(pathnameSplitList[pathnameSplitList.length - 1])}ResType`
      const isExistTypeName = detectionTypName(typeName)

      console.log('In process...', pathname)

      // decompress proxy response
      const _proxyRes = decompress(proxyRes, proxyRes.headers['content-encoding'])

      let buffer = Buffer.from('', 'utf8')
      // concat data stream
      _proxyRes.on('data', chunk => (buffer = Buffer.concat([buffer, chunk])))
      _proxyRes.on('end', async () => {
        if (genOnce) {
          try {
            const res = await fs.readFile(outputPath)
            if (isExistTypeName(res.toString())) {
              console.log(`Parameter type name ${typeName} already exists`)
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
            const code = generate(ast, {
              typeName,
            })
            // console.log(code)
            fs.readFile(outputPath).then((res) => {
              const data = res.toString()

              if (!isExistTypeName(data)) {
                console.log(chalk.green(`Have added: ${typeName}`))

                const newData = `${data}\n\n${code}`
                fs.writeFile(outputPath, newData)
              }
              else if (data.includes(code)) {
                console.log(chalk.blue(`No change: ${typeName}`))
              }
              else {
                if (validateStatus(proxyRes.statusCode || -1)) {
                  console.log(chalk.red(`Have changes: ${typeName}`))

                  const dataSplitList = data.split('export ')
                  const currentIndex = dataSplitList.findIndex(strItem => isExistTypeName(strItem))
                  // replace type code
                  dataSplitList.splice(currentIndex, 1, `${code}\n\n`)

                  const newData = dataSplitList.reduce((prevValue, curValue, index) => {
                    return prevValue + ((curValue.length && index !== currentIndex) ? `export ${curValue}` : curValue)
                  }, '')
                  fs.writeFile(outputPath, newData)
                }
                else {
                  console.error(`${proxyRes.statusCode}: ${pathname}`)
                  console.error('statusCode >= 200 && statusCode < 300 To generate parameter types.')
                }
              }
            }).catch(() => {
              fs.writeFile(outputPath, code)
            })
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
