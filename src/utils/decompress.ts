import type * as http from 'http'
import * as zlib from 'zlib'

/**
 * Streaming decompression of proxy response
 * source: https://github.com/apache/superset/blob/9773aba522e957ed9423045ca153219638a85d2f/superset-frontend/webpack.proxy-config.js#L116
 */
export default function decompress<TReq extends http.IncomingMessage = http.IncomingMessage>(
  proxyRes: TReq,
  contentEncoding?: string,
): TReq | zlib.Gunzip | zlib.Inflate | zlib.BrotliDecompress {
  let _proxyRes: TReq | zlib.Gunzip | zlib.Inflate | zlib.BrotliDecompress = proxyRes
  let decompress

  switch (contentEncoding) {
    case 'gzip':
      decompress = zlib.createGunzip()
      break
    case 'br':
      decompress = zlib.createBrotliDecompress()
      break
    case 'deflate':
      decompress = zlib.createInflate()
      break
    default:
      break
  }

  if (decompress) {
    // debug(`decompress proxy response with 'content-encoding': %s`, contentEncoding);
    _proxyRes.pipe(decompress)
    _proxyRes = decompress
  }

  return _proxyRes
}
