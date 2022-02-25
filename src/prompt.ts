import { VarInputStream, VarStream } from './varstream';
import { allToString } from '../../typenvy/src/index';

export interface PromptOptions {
    before?: ((settings: PromptSettings) => Promise<void> | void) | string | undefined,
    endAt?: string,
    clearBuffer?: boolean,
    readStream?: NodeJS.ReadStream,
    encoding?: BufferEncoding,
    timoutMillis?: number | -1,
    onTimeout?: ((settings: PromptSettings) => Promise<string | Error> | string | Error) | Promise<string | Error> | string | Error,
    onEnd?: ((settings: PromptSettings) => Promise<string | Error> | string | Error) | Promise<string | Error> | string | Error,
}

export interface PromptSettings extends PromptOptions {
    before: ((settings: PromptSettings) => Promise<void> | void) | string | undefined,
    endAt: string,
    clearBuffer: boolean,
    readStream: NodeJS.ReadStream,
    encoding: BufferEncoding,
    timoutMillis: number | -1,
    onTimeout: ((settings: PromptSettings) => Promise<string | Error> | string | Error) | Promise<string | Error> | string | Error,
    onEnd: ((settings: PromptSettings) => Promise<string | Error> | string | Error) | Promise<string | Error> | string | Error,
}

export const defaultPromptSettings: PromptSettings = {
    before: undefined,
    endAt: "\n",
    clearBuffer: false,
    readStream: process.stdin,
    encoding: "utf8",
    timoutMillis: 1000 * 60 * 5,
    onTimeout: () => new Error("Prompt input timeout!"),
    onEnd: () => new Error("End of input stream!"),
}

let textBuffer: string = ""
let currentPromise: Promise<string> | undefined
export async function prompt(
    options?: PromptOptions,
): Promise<string> {
    const settings: PromptSettings = {
        ...defaultPromptSettings,
        ...options
    }
    while (currentPromise) {
        await currentPromise
    }
    currentPromise = new Promise(async (res, rej) => {
        if (typeof settings.before == "function") {
            await settings.before(settings)
        } else if (typeof settings.before == "string") {
            console.log(settings.before)
        }
        if (settings.clearBuffer) {
            textBuffer = ""
        }
        let timeout: NodeJS.Timeout | undefined
        const removeListener = () => {
            settings.readStream.removeListener("data", onDate)
            settings.readStream.removeListener("end", onEnd)
            timeout && clearTimeout(timeout)
            end = true
            process.stdin.pause()
        }
        let end: boolean = false
        if (settings.timoutMillis > 0) {
            timeout = setTimeout(
                () => {
                    if (end) {
                        return
                    }
                    removeListener()
                    let timeoutValue
                    if (typeof settings.onTimeout == "function") {
                        timeoutValue = settings.onTimeout(settings)
                    } else if (typeof settings.onTimeout == "string") {
                        timeoutValue = settings.onTimeout
                    }
                    typeof timeoutValue == "string" ? res(timeoutValue) : rej(timeoutValue)
                },
                settings.timoutMillis
            )
        }
        const onDate = (data: Buffer) => {
            if (end) {
                return
            }
            textBuffer += data
            const index = textBuffer.indexOf(settings.endAt)
            if (index !== -1) {
                const line = textBuffer.substring(0, index)
                textBuffer = textBuffer.substring(index + 1)
                removeListener()
                res(line)
            }
        }
        const onEnd = () => {
            if (end) {
                return
            }
            removeListener()
            let timeoutValue
            if (typeof settings.onEnd == "function") {
                timeoutValue = settings.onEnd(settings)
            } else if (typeof settings.onEnd == "string") {
                timeoutValue = settings.onEnd
            }
            typeof timeoutValue == "string" ? res(timeoutValue) : rej(timeoutValue)
        }

        settings.readStream.setEncoding(settings.encoding)
        settings.readStream.resume()
        settings.readStream.on('data', onDate)
        settings.readStream.on('end', onEnd)
    })
    const value = await currentPromise
    currentPromise = undefined
    return value
}

export interface PromptStreamOptions {
    readStream?: NodeJS.ReadStream,
    encoding?: BufferEncoding,
    timoutMillis?: number | -1,
    onTimeout?: (settings: PromptStreamSettings) => Promise<string | Error> | string | Error,
    onEnd?: (settings: PromptStreamSettings) => Promise<string | Error> | string | Error,
}

export interface PromptStreamSettings extends PromptStreamOptions {
    readStream: NodeJS.ReadStream,
    encoding: BufferEncoding,
    timoutMillis: number | -1,
    onTimeout: (settings: PromptStreamSettings) => Promise<string | Error> | string | Error
    onEnd: (settings: PromptStreamSettings) => Promise<string | Error> | string | Error,
}

export const defaultPromptStreamSettings: PromptStreamSettings = {
    readStream: process.stdin,
    encoding: "utf8",
    timoutMillis: 1000 * 60 * 5,
    onTimeout: () => new Error("Prompt input timeout!"),
    onEnd: () => new Error("End of input stream!"),
}

export function promptStream(
    options?: PromptStreamOptions,
): VarInputStream<string> {
    const settings: PromptStreamSettings = {
        ...defaultPromptStreamSettings,
        ...options
    }
    const inputStream = new VarStream<string>()
    const p = new Promise<string>(async (res, rej) => {
        while (currentPromise) {
            await currentPromise
        }
        currentPromise = p
        let timeout: NodeJS.Timeout | undefined
        let end: boolean = false
        const removeListener = () => {
            settings.readStream.removeListener("data", onDate)
            settings.readStream.removeListener("end", onEnd)
            timeout && clearTimeout(timeout)
            end = true
            process.stdin.pause()
            currentPromise = undefined
        }
        if (settings.timoutMillis > 0) {
            timeout = setTimeout(
                () => {
                    if (end) {
                        return
                    }
                    removeListener()
                    const timeoutValue = settings.onTimeout(settings)
                    typeof timeoutValue == "string" ?
                        res(timeoutValue) :
                        rej(timeoutValue)
                },
                settings.timoutMillis
            )
        }
        inputStream.finally((meta) => {
            if (end) {
                return
            }
            removeListener()
            meta.err ?
                rej(meta.err) :
                res("")
        })
        const onDate = (data: Buffer) => {
            if (end) {
                return
            }
            const chars = allToString(data)
            for (let index = 0; index < chars.length; index++) {
                inputStream.write(chars[index])
            }
        }
        const onEnd = () => {
            if (end) {
                return
            }
            removeListener()
            const timeoutValue = settings.onEnd(settings)
            typeof timeoutValue == "string" ?
                res(timeoutValue) :
                rej(timeoutValue)
        }
        settings.readStream.setEncoding(settings.encoding)
        settings.readStream.resume()
        settings.readStream.on('data', onDate)
        settings.readStream.on('end', onEnd)
    })
    return inputStream.getInputVarStream()
}
