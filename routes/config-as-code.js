const Router = require('@koa/router');
const cli = require('../cli-wrapper');

const router = new Router()

router.get('/config-as-code/list-files', async (ctx, next) => {
    const args = ctx.state.harness.globals
    args.harnessUsername = ctx.state.harness.username
    args.harnessPassword = ctx.state.harness.password
    var text = await cli.runCommand('config-as-code:list-files', args)
    ctx.body = JSON.parse(text)
})

router.get('/config-as-code/get', async (ctx, next) => {
    const args = ctx.state.harness.globals
    args.harnessUsername = ctx.state.harness.username
    args.harnessPassword = ctx.state.harness.password
    if (ctx.query.raw === 'true') {
        args.raw = ''
    }
    args.path = `${ctx.query.path}`
    var text = await cli.runCommand('config-as-code:get', args)
    try {
        ctx.body = JSON.parse(text)
    } catch {
        ctx.body = text
    }
})

router.post('/config-as-code/upsert', async (ctx, next) => {
    const args = ctx.state.harness.globals
    args.harnessUsername = ctx.state.harness.username
    args.harnessPassword = ctx.state.harness.password
    args.content = ctx.request.body.content
    args.path = ctx.request.body.path
    var text = await cli.runCommand('config-as-code:upsert', args)
    try {
        ctx.body = JSON.parse(text)
    } catch {
        ctx.body = text
    }
})

module.exports = router