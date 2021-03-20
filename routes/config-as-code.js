const Router = require('@koa/router');
const cli = require('../cli-wrapper');

const router = new Router()

router.get('/yaml', async (ctx, next) => {
    const args = ctx.state.harness.globals
    args.harnessUsername = ctx.state.harness.username
    args.harnessPassword = ctx.state.harness.password
    var text = await cli.runCommand('config-as-code:list-files', args)
    ctx.body = JSON.parse(text)
})

router.get(/^\/yaml\/(.+)\.yaml$/, async (ctx, next) => {
    const args = ctx.state.harness.globals
    args.harnessUsername = ctx.state.harness.username
    args.harnessPassword = ctx.state.harness.password
    args.path = `${ctx.params[0]}.yaml`
    var text = await cli.runCommand('config-as-code:get', args)
    try {
        const content = JSON.parse(text)
        if (ctx.accepts('json')) { 
            ctx.body = content
        } else {
            ctx.body = content[0].content
        }
    } catch {
        ctx.body = text
    }
})

router.put('/yaml', async (ctx, next) => {
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