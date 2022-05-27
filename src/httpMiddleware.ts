import { IncomingMessage, ServerResponse } from "http"
import { Duplex } from "stream"

export type Awaitable<T> = Promise<T> | PromiseLike<T> | T

export type HttpMiddleware = (
    req: IncomingMessage,
    res: ServerResponse,
) => Awaitable<boolean>

export type WsMiddleware = (
    req: IncomingMessage,
    socket: Duplex,
    head: Buffer,
) => Awaitable<boolean>