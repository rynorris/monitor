const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
    app.use(
        "/api",
        createProxyMiddleware("/api", {
            target: "https://localhost:8080",
            ws: true,
            changeOrigin: true,
            secure: false,
            pathRewrite: {
                "^/api": "",
            },
            logLevel: "debug",
        })
    );
};
