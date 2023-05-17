# runtime-generated-type

[![NPM version](https://img.shields.io/npm/v/runtime-generated-type?color=a1b858&label=)](https://www.npmjs.com/package/runtime-generated-type)

## Install
```bash
$ npm install --save-dev runtime-generated-type
```

## Getting Started

- vite

```javascript
import { defineConfig } from 'vite'
import {createRuntimeGeneratedType} from 'runtime-generated-type'
import path from 'path'

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: createRuntimeGeneratedType({
          dataSource: '', // 指定接口返回数据的位置
          outputPath: path.resolve(__dirname, './src/types.ts'),
          baseUrl: '/api/*',
        }),
      },
    }
  }
})
```

- react-create-app -> setupProxy.js
```javascript
const path = require('path')
// "http-proxy-middleware": "3.0.0-beta.1"
const {createProxyMiddleware} = require('http-proxy-middleware')
const {createRuntimeGeneratedType} = require('runtime-generated-type')

const runtimeGeneratedTypePlugin = createRuntimeGeneratedType({
  dataSource: '', // 指定接口返回数据的位置
  outputPath: path.resolve(__dirname, './types.ts'),
  baseUrl: '/api/*',
})

module.exports = function(app) {
  app.use(
    createProxyMiddleware({
      pathFilter: '/api',
      target: 'http://jsonplaceholder.typicode.com',
      changeOrigin: true,
      pathRewrite: {'^/api' : ''},
      plugins: [runtimeGeneratedTypePlugin],
    })
  );
};
```

## Configuration

| 参数 | 类型 | 必填 | 参数说明 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| dataSource | String | false | 指定生成类型数据源位置 | 'data.item' |
| outputPath | String | true | 生成文件路径 | path.resolve(__dirname, './src/types.ts') |
| baseUrl | String | true | 配置请求接口地址的统一前缀  | '/api/*' (*号自动匹配任意字符) |
| genOnce | Boolean | false | 每个接口仅生成一次类型 |   |


Request url to generate type name matching rules

- GET:    /api/v1/team/department/frontGroup/:id       -> GetTeamFrontGroup
- GET:    /api/v1/team/department/endGroup/:id         -> GetTeamEndGroup
- GET:    /api/v1/team/department/endGroup/:id/details -> GetTeamEndGroupDetails

- GET:    /api/v1/teamMember  -> GetTeamMember
- PUT:    /api/v1/teamMember  -> PutTeamMember
- DELETE: /api/v1/teamMember  -> DeleteTeamMember

- POST:   /api/workflow/:id/inter/search -> PostWorkflowSearch
- POST:   /api/system/:id/inter/search   -> PostSystemSearch
- GET:    /api/user/:id/inter/search     -> GetUserSearch

## License

[MIT](./LICENSE) License © 2023 [Proc Zhang](https://github.com/proc07)
