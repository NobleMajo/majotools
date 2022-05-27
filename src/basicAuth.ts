import { IncomingMessage, ServerResponse } from "http"
import { HttpMiddleware, Awaitable } from './httpMiddleware';

export type HttpBasicAuthChecker = (
    username: string,
    passhash: string,
    req: IncomingMessage,
    res: ServerResponse,
) => Awaitable<boolean>

export function createHttpBasicAuthMiddleware(
    correctCredentials: HttpBasicAuthChecker,
    message: string | undefined = 'Authentication required.',
    basicAuthHeaders: {
        [key: string]: string
    } = {
            'WWW-Authenticate': 'Basic realm="401"',
        },
): HttpMiddleware {
    return async (req, res) => {
        let username = req.cookies.username ?? req.cookies.user ??
            req.headers.username ?? req.headers.user
        let password = req.cookies.passhash ?? req.cookies.password ??
            req.cookies.pass ?? req.headers.passhash ??
            req.headers.password ?? req.headers.pass
        if (Array.isArray(username)) {
            username = username[0]
        }
        if (Array.isArray(password)) {
            password = password[0]
        }

        if (
            typeof username != "string" ||
            typeof password != "string"
        ) {
            let token = req.cookies.authorization ?? req.cookies.auth ??
                req.cookies.token ?? req.headers.authorization ??
                req.headers.auth ?? req.headers.token
            if (Array.isArray(token)) {
                token = token[0]
            }
            if (typeof token == "string") {
                let index: number = token.indexOf(" ")
                token = token.substring(index + 1)
                index = token.indexOf(" ")
                if (index == -1) {
                    token = Buffer.from(
                        token.substring(0, index),
                        'base64'
                    ).toString('ascii')
                }
                index = token.indexOf(":")
                if (index == -1) {
                    username = token.substring(0, index)
                    password = token.substring(index + 1)
                }
            }
        }
        if (
            typeof username == "string" &&
            typeof password == "string" &&
            await correctCredentials(username, password, req, res)
        ) {
            return false
        }
        res.writeHead(
            401,
            basicAuthHeaders
        )
        if (typeof message == "string") {
            res.write(message)
        }
        return true

    }
}


