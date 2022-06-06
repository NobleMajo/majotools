import {
    RequestListener,
    IncomingMessage,
    Server as HttpServer,
    ServerOptions as HttpServerOptions,
    createServer as createHttpServer,
    ServerResponse,
} from "http"
import {
    Server as HttpsServer,
    ServerOptions as HttpsServerOptions,
    createServer as createHttpsServer
} from "https"
import { Duplex } from "stream"
import {
    Awaitable,
    HttpMiddleware,
    WsMiddleware
} from './httpMiddleware';

export type UpgradeListener = (
    req: IncomingMessage,
    socket: Duplex,
    head: Buffer
) => Awaitable<void>

export type HttpErrorHandler = (
    err: Error,
    req: IncomingMessage,
    res: ServerResponse,
) => Awaitable<void>

export type WsErrorHandler = (
    err: Error,
    req: IncomingMessage,
    socket: Duplex,
    head: Buffer,
) => Awaitable<void>

export interface BaseHttpServerOptions {
    port?: number,
    httpPort?: number,
    httpsPort?: number,
    timeout?: number,
    httpMiddleware?: HttpMiddleware[],
    wsMiddleware?: WsMiddleware[],
    bindAddress?: string,
    bindHttpAddress?: string,
    bindHttpsAddress?: string,
    serverOptions?: HttpServerOptions & HttpsServerOptions,
    httpServerOptions?: HttpServerOptions,
    httpsServerOptions?: HttpsServerOptions,
    httpErrorHandler?: HttpErrorHandler,
    wsErrorHandler?: WsErrorHandler,
}

export interface BaseHttpServerSettings {
    port: number,
    httpPort: number,
    httpsPort: number,
    timeout: number,
    httpMiddleware: HttpMiddleware[],
    wsMiddleware: WsMiddleware[],
    bindAddress: string,
    bindHttpAddress?: string,
    bindHttpsAddress?: string,
    serverOptions: HttpServerOptions & HttpsServerOptions,
    httpServerOptions?: HttpServerOptions,
    httpsServerOptions?: HttpsServerOptions,
    httpErrorHandler: HttpErrorHandler,
    wsErrorHandler: WsErrorHandler,
}

export const defaultBaseHttpServerSettings: BaseHttpServerSettings = {
    port: -1,
    httpPort: -1,
    httpsPort: -1,
    timeout: 1000 * 2,
    httpMiddleware: [],
    wsMiddleware: [],
    bindAddress: "127.0.0.1",
    bindHttpAddress: undefined,
    bindHttpsAddress: undefined,
    serverOptions: {},
    httpServerOptions: undefined,
    httpsServerOptions: undefined,
    httpErrorHandler: (err) => console.error("Http server error: ", err),
    wsErrorHandler: (err) => console.error("WebSocket server error: ", err),
}

export interface BaseHttpServer {
    settings: BaseHttpServerSettings,
    httpsServer: HttpsServer,
    httpServer: HttpServer,
}

export async function createBaseHttpServer(
    options: BaseHttpServerOptions,
): Promise<BaseHttpServer> {
    const settings: BaseHttpServerSettings = {
        ...defaultBaseHttpServerSettings,
        ...options,
    }

    const requestListener: RequestListener = async (req, res) => {
        try {
            if (!settings.httpMiddleware || settings.httpMiddleware.length == 0) {
                throw new Error("Http request but no http middleware is defined!")
            }
            for (const middleware of settings.httpMiddleware) {
                await new Promise<void>(
                    (resolve, reject) => middleware(
                        req,
                        res,
                        (err) => err ? reject(err) : resolve()
                    )
                )
            }
        } catch (err) {
            try {
                if (res.headersSent != true) {
                    res.writeHead(500, "Internal Server Error")
                }
            } catch (err) { }
            try {
                req.destroy()
            } catch (err) { }
            try {
                res.destroy()
            } catch (err) { }
            settings.httpErrorHandler(err, req, res)
        }
    }
    const upgradeListener: UpgradeListener = async (req, sock, head) => {
        try {
            if (!settings.wsMiddleware || settings.wsMiddleware.length == 0) {
                throw new Error("Websocket connection but no websocket middleware is defined!")
            }
            for (const middleware of settings.wsMiddleware) {
                await new Promise<void>(
                    (resolve, reject) => middleware(
                        req,
                        sock,
                        head,
                        (err) => err ? reject(err) : resolve()
                    )
                )
            }
        } catch (err) {
            try {
                req.destroy()
            } catch (err) { }
            try {
                sock.destroy()
            } catch (err) { }
            settings.wsErrorHandler(err, req, sock, head)
        }
    }

    const [httpServer, httpsServer] = await Promise.all([
        new Promise<HttpServer>(async (res) => {
            const server: HttpServer = await createHttpServer(
                {
                    ...settings.httpServerOptions,
                    ...settings.serverOptions,
                },
                requestListener,
            )
            server.setTimeout(settings.timeout)
            upgradeListener && server.on('upgrade', upgradeListener)
            server.listen(
                settings.httpPort != -1 ? settings.httpPort : settings.port,
                settings.bindHttpAddress ?? settings.bindAddress ?? "127.0.0.1",
                () => res(server),
            )
        }),
        new Promise<HttpsServer>(async (res) => {
            const server: HttpsServer = createHttpsServer(
                {
                    ...settings.httpsServerOptions,
                    ...settings.serverOptions,
                },
                requestListener,
            )
            server.setTimeout(settings.timeout)
            upgradeListener && server.on('upgrade', upgradeListener)
            server.listen(
                settings.httpsPort != -1 ? settings.httpsPort : settings.port,
                settings.bindHttpAddress ?? settings.bindAddress ?? "127.0.0.1",
                () => res(server),
            )
        }),
    ])

    return {
        settings: settings,
        httpServer: httpServer,
        httpsServer: httpsServer
    }
}

export async function closeServer(
    server: HttpsServer | HttpServer | undefined,
) {
    if (server) {
        await new Promise<void>(
            (res, rej) =>
                server ?
                    server.close(
                        (err) =>
                            err ? rej(err) : res()
                    ) :
                    res()
        )
    }
}