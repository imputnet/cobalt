import { spawn as _node_spawn } from 'child_process'

export function killProcess(p) {
    // ask the process to terminate itself gracefully
    p?.kill('SIGTERM');
    setTimeout(() => {
        if (p?.exitCode === null)
            // brutally murder the process if it didn't quit
            p?.kill('SIGKILL');
    }, 5000);
}

export function pipe(from, to, done) {
    from.on('error', done)
        .on('close', done);

    to.on('error', done)
      .on('close', done);

    from.pipe(to);
}

export function wrapCommand(command, args = []) {
    if (process.env.PROCESSING_PRIORITY && process.platform !== "win32") {
        return ['nice', ['-n', process.env.PROCESSING_PRIORITY, command, ...args]]
    }

    return [command, args]
}

export function spawn(command, args, opts) {
    opts = {
        ...opts,
        windowsHide: true
    };

    return _node_spawn(...wrapCommand(command, args), opts);
}