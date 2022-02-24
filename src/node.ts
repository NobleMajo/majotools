
import { fork, ForkOptions } from "child_process"
import process = require("process")
import { LogType, VarInputStream, VarStream } from "./varstream"

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
): VarInputStream<LogType<Buffer>> {
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

    const logStream = new VarStream<LogType<Buffer>>()
    const writeStream = new VarStream<LogType<Buffer>>()
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
                if (varStream.isClosed()) {
                    return
                }
                if (timeout) {
                    clearTimeout(timeout)
                }
                varStream.end(
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
    if (task.stdout) {
        task.stdout.on(
            'data',
            (data: Buffer | string) => {
                if (!(data instanceof Buffer)) {
                    data = Buffer.from(data)
                }
                varStream.write([false, data])
            }
        )
    }
    if (task.stderr) {
        task.stderr.on(
            'data',
            (data: Buffer | string) => {
                if (!(data instanceof Buffer)) {
                    data = Buffer.from(data)
                }
                varStream.write([false, data])
            }
        )
    }
    task.on(
        "error",
        (err) => {
            if (varStream.isClosed()) {
                return
            }
            if (timeout) {
                clearTimeout(timeout)
            }
            varStream.end(err)
        }
    )
    task.on(
        'close',
        (code) => {
            if (varStream.isClosed()) {
                return
            }
            if (timeout) {
                clearTimeout(timeout)
            }
            varStream.end(undefined, {
                code: code
            })
        }
    )
    return varStream
}

