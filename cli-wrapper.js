const {stdout, stderr} = require('stdout-stderr')
const cli = require('@ldhertert/harness-cli')

module.exports.runCommand = async function(command, flags) {
    stdout.start() 
    stderr.start()
    // stdout.print = true
    // stderr.print = true

    const args = [ command ]
    if (flags) {
        Object.keys(flags).forEach(key => {
            args.push(`--${key}`)
            if (flags[key]) {
                args.push(flags[key])
            }
        })
    }
    try {
        await cli.run(args)

        stdout.stop()
        stderr.stop()

        return stdout.output
    } catch(ex) {
        stdout.stop()
        stderr.stop()
        throw new Error(`Error running command: harness ${args.join(' ')}.\Exception: ${ex.message}}\nstderr: ${stderr.output}`)
    }
}