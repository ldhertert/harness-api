const Router = require('@koa/router');
const jwt = require('jsonwebtoken');
const Config = require('../config')

const router = new Router()

router.post('/login', async (ctx, next) => {
    var token = jwt.sign({ 
        harnessAccountId: ctx.request.body.harnessAccountId,
        harnessApiKey: ctx.request.body.harnessApiKey,
        harnessUsername: ctx.request.body.harnessUsername,
        harnessPassword: ctx.request.body.harnessPassword,
    }, Config.jwtSecret);
    ctx.body = {
        token: token
    }
    ctx.cookies.set(Config.jwtCookieName, token)
})

module.exports = router