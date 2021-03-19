const Router = require('@koa/router');
const cli = require('../cli-wrapper');

const router = new Router()

router.get('/apps', async (ctx, next) => {
    var text = await cli.runCommand('apps:list', ctx.state.harness.globals)
    ctx.body = JSON.parse(text)
})

router.get('/apps/:nameOrId', async (ctx, next) => {
    const args = ctx.state.harness.globals
    args.nameOrId = ctx.params.nameOrId
    var text = await cli.runCommand('apps:get', args)
    ctx.body = JSON.parse(text)
})

module.exports = router