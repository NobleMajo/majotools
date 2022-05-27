import { HttpMiddleware } from "./httpMiddleware";

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
    return (req, res) => {
        req.cookies = parseCookies(req.headers["cookie"] ?? "")
        res.cookies = {}
        res.setCookies = settings.autoSetCookies
        res.overwriteOldCookies = settings.overwriteOldCookies
        res.oldCookies = settings.oldCookies

        objectFunctionMiddleware(
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
        return false
    }
}


export type FuncObj<N extends string> = {
    [key in N]: (...params: [...any[]]) => any
}

export function objectFunctionReplace<Key extends string, Obj extends FuncObj<Key>>(
    obj: Obj,
    name: Key,
    repalcement: Obj[Key],
    times: number = -1,
): void {
    const oldFunc: Obj[Key] = obj[name]
    obj[name] = (
        (...params: any[]) => {
            if (times > -1) {
                times--
                if (times < 1) {
                    obj[name] = oldFunc
                }
            }
            return repalcement(...params)
        }
    ) as any
}

export function objectFunctionMiddleware<Key extends string, Obj extends FuncObj<Key>>(
    obj: Obj,
    name: Key,
    middleware: (next: Obj[Key], params: Parameters<Obj[Key]>) => ReturnType<Obj[Key]>,
    times: number = -1,
): void {
    if (typeof obj != "object" || obj == null) {
        throw new Error("First 'obj' parameter is not a object!")
    }
    let i = 2
    let newName: string
    do {
        newName = name + i++
    } while (typeof (obj as any)[newName] != undefined)
    (obj as any)[newName] = obj[name]
    obj[name] = (
        (...params: any[]) => {
            if (times > -1) {
                times--
                if (times < 1) {
                    obj[name] = (obj as any)[newName]
                }
            }
            return middleware(
                (
                    (
                        ...params: Parameters<Obj[Key]>
                    ): ReturnType<Obj[Key]> => (obj as any)[newName](...params)
                ) as any,
                params as any
            )
        }
    ) as any
}

