const Koa = require('koa');
const Router = require('@koa/router');
const jwt = require('jsonwebtoken')
const bodyParser = require('koa-bodyparser');
var basicAuth = require('basic-auth')
const serverless = require('serverless-http');

const authRoutes = require('./routes/auth')
const staticRoutes = require('./routes/static')
const applicationRoutes = require('./routes/apps')
const configAsCodeRoutes = require('./routes/config-as-code');
const config = require('./config');

const app = new Koa();
app.use(bodyParser());

const publicRoutes = new Router()
const publicRoutesToUse = [authRoutes, staticRoutes]
publicRoutesToUse.forEach(router => {
    publicRoutes.use(router.routes())
    publicRoutes.use(router.allowedMethods())
})

const privateRoutes = new Router()

// Populate args based on global parameters
privateRoutes.use(async(ctx, next) => {
    try {
        const encoded = ctx.cookies.get(config.jwtCookieName) || ctx.headers['x-jwt-token']
        const decoded = jwt.decode(encoded, config.jwtSecret)
        if (decoded && decoded.harnessAccountId) {
            ctx.state.user = decoded
            console.log(decoded)
        }
    } catch (ex) {
        console.log(ex)
    }

    const harnessConfig = {}
    const jwtUser = ctx.state.user || {}

    let basicCreds = basicAuth(ctx) || {}
    if (basicCreds.name && basicCreds.pass === '') {
        basicCreds.apiKey = basicCreds.name
        basicCreds.name = undefined
    }

    harnessConfig.username = basicCreds.name || ctx.query.harnessUsername || jwtUser.harnessUsername || ctx.headers['x-harness-username'] || process.env.HARNESS_USERNAME
    harnessConfig.password = basicCreds.pass || ctx.query.harnessPassword || jwtUser.harnessPassword || ctx.headers['x-harness-password'] || process.env.HARNESS_PASSWORD
    harnessConfig.accountId = ctx.query.harnessAccountId || jwtUser.harnessAccountId || ctx.headers['x-harness-account-id'] || process.env.HARNESS_ACCOUNT_ID
    harnessConfig.apiKey = basicCreds.apiKey || ctx.query.harnessApiKey || jwtUser.harnessApiKey || ctx.headers['x-harness-api-key'] || process.env.HARNESS_API_KEY
    harnessConfig.managerUrl = 'https://app.harness.io'
    harnessConfig.globals = {
        harnessAccountId: harnessConfig.accountId,
        harnessApiKey: harnessConfig.apiKey,
        managerUrl: harnessConfig.managerUrl
    }

    ctx.state.harness = harnessConfig

    return next()
})

const privateRoutesToUse = [applicationRoutes, configAsCodeRoutes]

privateRoutesToUse.forEach(router => {
    privateRoutes.use(router.routes())
    privateRoutes.use(router.allowedMethods())
})

app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      // will only respond with JSON
      ctx.status = err.statusCode || err.status || 500;
      ctx.body = {
          errors: [{
            message: err.message
          }]
      };
    }
  })

app
    .use(publicRoutes.routes())
    .use(publicRoutes.allowedMethods())
    .use(privateRoutes.routes())
    .use(privateRoutes.allowedMethods())

module.exports = {
    start: (port) => {
        app.listen(port);
        return app
    },
    app: app,
    serverless: serverless(app)
}
