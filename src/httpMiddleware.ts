import { IncomingMessage, ServerResponse } from "http"
import { Duplex } from "stream"

export type Awaitable<T> = Promise<T> | PromiseLike<T> | T
export type NextFunction = (err?: Error) => void

export type HttpMiddleware = (
    req: IncomingMessage,
    res: ServerResponse,
    next: NextFunction,
) => Awaitable<void>

export type WsMiddleware = (
    req: IncomingMessage,
    socket: Duplex,
    head: Buffer,
    next: NextFunction,
) => Awaitable<void>