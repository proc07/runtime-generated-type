const path = require('path')
const {createProxyMiddleware} = require('http-proxy-middleware')
const {createRuntimeGeneratedType} = require('../../../dist/index.cjs');

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