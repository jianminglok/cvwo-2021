const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'http://cvwo-backend:8080',
            changeOrigin: false
        })
    );
};