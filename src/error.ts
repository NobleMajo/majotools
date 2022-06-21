import { parseStackTraceElement, parseStackTraceElements, stringifyStackTraceElements } from "./stack"

export class WrappingError extends Error {
    constructor(err: Error, msg?: string) {
        super(
            (msg ? msg + ":" : "") +
            err.message
        )
        this.stack = this.message + "\n" + stringifyStackTraceElements([
            ...parseStackTraceElements(this.stack),
            {
                method: "WrappedError",
                module: "majotools/dist/error",
            },
            ...parseStackTraceElements(this.stack)
        ])
    }
}