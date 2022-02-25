
import { fork, ForkOptions } from "child_process"
import process = require("process")
import { LogType, VarStream, VarDuplex, createVarDuplex } from './varstream';

export interface NodeOptions extends ForkOptions {
    pipeEnv?: boolean,
    timeoutMillis?: number | -1
}

export interface NodeSettings extends NodeOptions {
    pipeEnv: boolean,
    timeoutMillis: number | -1
}

export const defaultNodeSettings: NodeSettings = {
    pipeEnv: false,
    timeoutMillis: 1000 * 60 * 5
}

export function node(
    script: string,
    args: string[],
    options?: NodeOptions
): VarDuplex<LogType<Buffer>, Buffer> {
    const settings: NodeSettings = {
        ...defaultNodeSettings,
        ...options,
    }
    if (settings.pipeEnv) {
        settings.env = {
            ...process.env,
            ...settings.env
        }
    }
    const inStream = new VarStream<LogType<Buffer>>()
    const outStream = new VarStream<Buffer>()
    const task = fork(
        script,
        args,
        {
            ...settings,
            silent: true,
        },
    )
    let timeout: NodeJS.Timeout | undefined
    if (settings.timeoutMillis > 0) {
        timeout = setTimeout(
            () => {
                if (timeout) {
                    clearTimeout(timeout)
                }
                outStream.end(
                    new Error(
                        "Timeout for command 'node " +
                        script +
                        "' ('" +
                        settings.timeoutMillis +
                        "'ms)!"
                    )
                )
            },
            settings.timeoutMillis
        )
    }
    if (!task.stdout) {
        throw new Error("No 'stdout' for fork found")
    }
    task.stdout.on(
        'data',
        (data: Buffer | string) => {
            if (!(data instanceof Buffer)) {
                data = Buffer.from(data)
            }
            inStream.write([false, data])
        }
    )
    if (!task.stderr) {
        throw new Error("No 'stderr' for fork found")
    }
    task.stderr.on(
        'data',
        (data: Buffer | string) => {
            if (!(data instanceof Buffer)) {
                data = Buffer.from(data)
            }
            inStream.write([false, data])
        }
    )
    if (!task.stdin) {
        throw new Error("No 'stdin' for fork found")
    }
    outStream.forEach((buf) => task.stdin?.write(
        buf,
        (err) => err && outStream.end(err)
    ))
    outStream.finally((meta) => task.stdin?.end(meta.err))
    task.on(
        "error",
        (err) => {
            if (timeout) {
                clearTimeout(timeout)
            }
            inStream.end(err)
            outStream.end()
        }
    )
    task.on(
        'close',
        (code) => {
            if (timeout) {
                clearTimeout(timeout)
            }
            inStream.end(undefined, {
                code: code
            })
            outStream.end()
        }
    )
    return createVarDuplex(
        inStream.getInputVarStream(),
        outStream.getOutputVarStream(),
    )
}

export default node
