const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  const isLocal = process.env.REACT_APP_API_DOMAIN == 'http://localhost:8888';
  app.use(
    '/service',
    createProxyMiddleware({
      target: process.env.REACT_APP_API_DOMAIN,
      changeOrigin: true,
      pathRewrite: (path, req) => {
        return path.replace(
          '^/service',
          isLocal ? '/api' : '/api'
        );
      },
    })
  );
};