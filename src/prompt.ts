import { splitAndClean } from "./string"


export interface PromptOptions {
    before?: (() => Promise<void> | void) | string | undefined,
    endAt?: string,
    clearBuffer?: boolean,
    readStream?: NodeJS.ReadStream,
    encoding?: BufferEncoding,
    timoutMillis?: number | -1,
    onTimeout?: (settings: PromptSettings) => Promise<string | Error> | string | Error,
    onEnd?: (settings: PromptSettings) => Promise<string | Error> | string | Error,
}

export interface PromptSettings extends PromptOptions {
    before: (() => Promise<void> | void) | string | undefined,
    endAt: string,
    clearBuffer: boolean,
    readStream: NodeJS.ReadStream,
    encoding: BufferEncoding,
    timoutMillis: number | -1,
    onTimeout: (settings: PromptSettings) => Promise<string | Error> | string | Error
    onEnd: (settings: PromptSettings) => Promise<string | Error> | string | Error,
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
            await settings.before()
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
                    const timeoutValue = settings.onTimeout(settings)
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
            const timeoutValue = settings.onEnd(settings)
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


export type PromptChecker<T> = (value: string, settings: PromptTypeSettings) => Promise<void | undefined | T> | void | undefined | T
export type PromptCallback<T> = (value: T, origin: string, settings: PromptTypeSettings, checker: PromptMiddleware<T>) => Promise<void> | void

export interface PromptMiddleware<T> {
    checker: PromptChecker<T>,
    callback: PromptCallback<T>,
}

export interface PromptTypeOptions extends PromptOptions {
    middlewares: [PromptMiddleware<any>, ...PromptMiddleware<any>[]],
    notFound: () => Promise<void> | void,
}

export interface PromptTypeSettings extends PromptTypeOptions {
    middlewares: [PromptMiddleware<any>, ...PromptMiddleware<any>[]],
    notFound: () => Promise<void> | void,
}

export const defaultPromptTypeSettings: PromptTypeSettings = {
    middlewares: [] as any,
    notFound: undefined as any,
}

export async function promptType(
    options?: PromptTypeOptions,
): Promise<void> {
    const settings: PromptTypeSettings = {
        ...defaultPromptTypeSettings,
        ...options,
    }
    if (
        !Array.isArray(settings.middlewares) ||
        settings.middlewares.length < 1
    ) {
        throw new Error("No prompt middleware defined")
    }
    if (!settings.notFound) {
        throw new Error("No prompt 'notFound' callback defined")
    }
    while (true) {
        const input = await prompt(options)
        for (let index = 0; index < settings.middlewares.length; index++) {
            const middleware = settings.middlewares[index]
            const value = await middleware.checker(input, settings)
            if (value) {
                return await middleware.callback(
                    value,
                    input,
                    settings,
                    middleware,
                )
            }
        }
        await settings.notFound()
    }
}

export function typeNumber(
    callback: PromptCallback<number>,
): PromptMiddleware<number> {
    return {
        checker: (value) => {
            const value2 = Number(value)
            if (!isNaN(value2)) {
                return value2
            }
        },
        callback: callback
    }
}

export function typeNumberBetween(
    callback: PromptCallback<number>,
    min: number,
    max: number,
): PromptMiddleware<number> {
    return {
        checker: (value) => {
            const value2 = Number(value)
            if (!isNaN(value2) && value2 <= max && value2 >= min) {
                return value2
            }
        },
        callback: callback
    }
}

export function typeCSV(
    callback: PromptCallback<number>,
    minimumValues: number = 1,
    seperator: string = ",",
    ...removeEntryWrappingStrings: string[]
): PromptMiddleware<number> {
    return {
        checker: (value) => {
            const values = splitAndClean(
                value,
                seperator,
                ...removeEntryWrappingStrings
            )
            if (values.length > 0) {
                return values
            }
            return undefined
        },
        callback: callback,
    }
}

export function typeString(
    callback: PromptCallback<string>,
): PromptMiddleware<string> {
    return {
        checker: (value) => {
            return value
        },
        callback: callback,
    }
}
