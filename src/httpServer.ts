import {
    Server as HttpServer,
    ServerOptions as HttpServerOptions,
    createServer as createHttpServer,

} from "http"
import {
    RequestListener,
    IncomingMessage,
    Server as HttpsServer,
    ServerOptions as HttpsServerOptions,
    createServer as createHttpsServer
} from "https"
import { Duplex } from "stream"
import {
    HttpMiddleware,
    WsMiddleware
} from './httpMiddleware';

export type UpgradeListener = (req: IncomingMessage, socket: Duplex, head: Buffer) => void

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

    const requestListener: RequestListener = (req, res) => {

    }
    const upgradeListener: UpgradeListener = (req, sock, buf) => {

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