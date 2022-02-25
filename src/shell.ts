import { spawn, SpawnOptionsWithoutStdio } from "child_process"
import { LogType, VarInputStream, VarStream } from "./varstream"

export interface ShellOptions extends SpawnOptionsWithoutStdio {
    pipeEnv?: boolean,
    timeoutMillis?: number | -1,
}

export interface ShellSettings extends ShellOptions {
    pipeEnv: boolean,
    timeoutMillis: number | -1,
}

export const defaultShellSettings: ShellSettings = {
    pipeEnv: false,
    timeoutMillis: 1000 * 60 * 5,
}

export function shell(
    cmd: string | string[],
    options?: ShellOptions
): VarInputStream<LogType<Buffer>> {
    const settings: ShellSettings = {
        ...defaultShellSettings,
        ...options,
    }
    if (options && options.pipeEnv) {
        options.env = {
            ...process.env,
            ...options.env
        }
    }

    if (typeof cmd == "string") {
        const index = cmd.indexOf(" ")
        while (cmd.startsWith(" ")) {
            cmd = cmd.substring(1)
        }
        while (cmd.endsWith(" ")) {
            cmd = cmd.slice(0, -1)
        }
        if (index <= 0 && index >= cmd.length) {
            cmd = [cmd]
        } else {
            cmd = [cmd.substring(0, index), cmd.substring(index + 1)]
        }
    }
    if (!Array.isArray(cmd)) {
        throw new Error("Command for shell need to be a string or string array!")
    }
    if (cmd.length == 0) {
        throw new Error("Can't run shell with empty command!")
    }
    let args = [...cmd]
    args.shift()
    cmd = cmd[0]
    const varStream = new VarStream<LogType<Buffer>>()
    const task = spawn(cmd, args, options)
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
                        "Timeout for command '" +
                        cmd +
                        "' ('" +
                        settings.timeoutMillis +
                        "')!"
                    ),
                    {
                        cmd: cmd,
                        settings: settings,
                    }
                )
            },
            settings.timeoutMillis
        )
    }
    task.stdout.on(
        'data',
        (data) => {
            if (!(data instanceof Buffer)) {
                data = Buffer.from(data)
            }
            varStream.write([false, data])
        }
    )
    task.stderr.on(
        'data',
        (data) => {
            if (!(data instanceof Buffer)) {
                data = Buffer.from(data)
            }
            varStream.write([true, data])
        }
    )
    task.on("error", (err) => {
        if (task.stdin) {
            task.stdin.end()
        }
        if (varStream.isClosed()) {
            return
        }
        if (timeout) {
            clearTimeout(timeout)
        }
        varStream.end(err)
    })
    task.on('close', (code) => {
        if (task.stdin) {
            task.stdin.end()
        }
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
    return varStream.getInputVarStream()
}

export default shell
