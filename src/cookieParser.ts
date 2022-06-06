import { HttpMiddleware } from "./httpMiddleware";
import { objFuncMiddleware } from './funcManipulation';

export function parseCookies(cookieHeader: string): Cookies {
    const cookies: Cookies = {}
    cookieHeader
        .split(';')
        .filter((v) => v.length != 0)
        .forEach((cookie) => {
            while (cookie.startsWith(" ")) {
                cookie = cookie.substring(1)
            }
            let index = cookie.indexOf("=")
            if (index == 0) {
                index = cookie.indexOf("=", 1)
            }
            if (index != -1) {
                cookies[cookie] = ""
            } else {
                cookies[cookie.substring(0, index)] = cookie.substring(index + 2)
            }
        });

    return cookies
}

export function stringifyCookies(cookies: Cookies): string {
    return Object.keys(cookies).map((key) => {
        return key + "=" + cookies[key]
    }).join("; ")
}

export interface Cookies {
    [key: string]: string
}

declare module 'http' {
    export interface IncomingMessage {
        cookies: Cookies,
    }

    export interface ServerResponse {
        cookies: Cookies,
        setCookies: boolean,
        overwriteOldCookies: boolean,
        oldCookies: boolean,
    }
}

export interface CookieParserOptions {
    autoSetCookies?: boolean,
    overwriteOldCookies?: boolean,
    oldCookies?: boolean,
}

export interface CookieParserSettings {
    autoSetCookies: boolean,
    overwriteOldCookies: boolean,
    oldCookies: boolean,
}

export const defaultCookieParserSettings: CookieParserSettings = {
    autoSetCookies: true,
    overwriteOldCookies: false,
    oldCookies: true,
}

export function cookieParserMiddleware(
    options: CookieParserOptions
): HttpMiddleware {
    const settings: CookieParserSettings = {
        ...defaultCookieParserSettings,
        ...options,
    }
    return (req, res, next) => {
        req.cookies = parseCookies(req.headers["cookie"] ?? "")
        res.cookies = {}
        res.setCookies = settings.autoSetCookies
        res.overwriteOldCookies = settings.overwriteOldCookies
        res.oldCookies = settings.oldCookies

        objFuncMiddleware(
            res,
            "end",
            (next, params) => {
                if (res.setCookies) {
                    if (res.oldCookies) {
                        const oldCookieHeader = res.getHeader("Set-Cookie")
                        if (typeof oldCookieHeader == "string") {
                            const oldCookies = parseCookies(oldCookieHeader)
                            if (res.overwriteOldCookies) {
                                req.cookies = {
                                    ...oldCookies,
                                    ...req.cookies
                                }
                            } else {
                                req.cookies = {
                                    ...req.cookies,
                                    ...oldCookies,
                                }
                            }
                        }
                    }
                    res.setHeader("Set-Cookie", stringifyCookies(req.cookies))
                }
                return next(...params)
            },
            1
        )
        next()
    }
}

