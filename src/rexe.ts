import { JsonTypes } from "./json"
import { RequestHandler } from 'express'
import fetch, { Response } from "node-fetch"
import { Awaitable } from "./httpMiddleware"

export type RexeFunction = (
    ...params: any[]
) => Awaitable<JsonTypes | void>

export interface AbstractRexeInstance {
    [key: string]: RexeFunction | AbstractRexeInstance,
}

export interface RexeInstance {
    [key: string]: RexeFunction | RexeInstance,
    values(): string[],
}

export type RexeHttpMethod = "get" | "post" | "pust" | "patch" | "delete"

export type RexeRequest = [
    string,
    ...JsonTypes[],
]

export class RexeRequestError extends Error {
    public static maxDataLenght: number = 512

    constructor(
        public errorMessage: string,
        public requestData: any,
    ) {
        super(
            errorMessage + ":\n'" +
            (
                requestData = JSON.stringify(requestData, null, 4)
                    .substring(0, RexeRequestError.maxDataLenght)
            ) +
            "'"
        )
        this.requestData = requestData
    }
}

export class RexeFetchError extends Error {
    constructor(
        message: string,
        public origin?: Error,
    ) {
        super(message)
        if (origin) {
            this.message += "\nOrigin Error:\n'" + origin.message
            this.stack = "Origin Error:\n'" + origin.stack + "\nError:\n" + this.stack
        }
    }
}

export function createRexeMiddleware(
    rexe: AbstractRexeInstance,
): RequestHandler {
    return async (req, res, next) => {
        try {
            if (
                req.method != "POST" ||
                req.header("accept") != "application/rexe"
            ) {
                next()
                return
            }

            let body = ""
            req.on('data', function (data) {
                body += data;
            })
            await new Promise<void>((res, rej) => {
                req.on('end', res)
                req.on('error', rej)
            })

            const data = JSON.parse(body)

            if (!Array.isArray(data)) {
                throw new RexeRequestError(
                    "Remote execute request data is not an array",
                    body
                )
            } else if (typeof data[0] != "string") {
                throw new RexeRequestError(
                    "First value of the remote execute request data is not a string",
                    data[0]
                )
            } else if (data[0].includes(" ")) {
                throw new RexeRequestError(
                    "Function key of remote execute request data contains spaces (' ')",
                    data[0]
                )
            }
            const selectors = data[0].split(".")
            let value: RexeFunction | AbstractRexeInstance = rexe
            for (const selector of selectors) {
                value = value[selector]
                if (selector == "values") {
                    const values = Object.keys(value)
                    value = () => values
                    break
                }
                if (
                    typeof value != "object" &&
                    typeof value != "function"
                ) {
                    throw new RexeRequestError(
                        "The selector '" +
                        selector.substring(0, 512) +
                        "' in remote execute request data could not be found or is not type of object or function",
                        data[0]
                    )
                }
            }
            if (typeof value != "function") {
                throw new RexeRequestError(
                    "The last selector of the remote execute request data dont targets a function",
                    data[0]
                )
            }
            let status: 200 | 400 = 200
            let result: any
            try {
                result = await value(...data.slice(1))
            } catch (err: Error | any) {
                err = await err
                if (err! instanceof Error) {
                    err = new Error("Throwable:\n" + JSON.stringify(err, null, 4))

                }
                result = {
                    ...err,
                    name: err.name,
                    message: err.message,
                    stack: err.stack,
                    cause: err.cause,
                }
                status = 400
            }
            let resultString: string
            try {
                resultString = !result ? "void" : JSON.stringify(result)
            } catch (err: Error | any) {
                throw new RexeRequestError(
                    "Can't parse remote execute function result into a json string because",
                    err.stack ?? err.message ?? ("" + err)
                )
            }
            res.status(status)
                .setHeader("Content-Type", "application/rexe")
                .send(resultString)
        } catch (err) {
            next(err)
        }
    }
}

export function createRexeObject<R extends AbstractRexeInstance>(
    url: string,
    origin: R,
    selectorPrefix: string = ""
): R & RexeInstance {
    const ret: R & RexeInstance = {
        values: (
            ...params: any[]
        ) => fetchRex(
            url,
            selectorPrefix + "values",
            params,
        )
    } as any

    for (const key of Object.keys(origin)) {
        const value = origin[key]
        if (typeof value == "object") {
            (ret as any)[key] = createRexeObject(
                url, value, selectorPrefix + key + "."
            )
        } else if (typeof value == "function") {
            (ret as any)[key] = (
                ...params: any[]
            ) => fetchRex(
                url,
                selectorPrefix + key,
                params
            )
        }
    }

    return ret
}

export async function fetchRex(
    url: string,
    selector: string,
    params: any[] = [],
): Promise<JsonTypes | void> {
    if (selector.length == 0) {
        throw new RexeFetchError("Selector is an empty string")
    }
    let fetchData: string
    try {
        fetchData = JSON.stringify([selector, ...params])
    } catch (err) {
        throw new RexeFetchError("Can't parse remote execute fetch data", err)
    }
    let resp: Response
    try {
        resp = await fetch(
            url,
            {
                method: "post",
                headers: {
                    "Accept": "application/rexe"
                },
                body: fetchData,
            }
        )
    } catch (err) {
        throw new RexeFetchError("Error while remote execute fetch", err)
    }
    if (resp.status == 400) {
        const data = await resp.json()
        const err = new Error(data.message ?? "Unknown error message")
        for (const key of Object.keys(data)) {
            (err as any)[key] = data[key]
        }
        throw err
    } else if (resp.status != 200) {
        throw new RexeFetchError("Remote execute fetch response status is '" + resp.status + "' and not '400' or '200'")
    }
    if (
        !resp.headers
            .get("Content-Type")
            .toLowerCase()
            .startsWith("application/rexe")
    ) {
        throw new RexeFetchError("Remote execute fetch response content-type header is '" + resp.headers.get("Content-Type") + "' and not 'application/rexe'")
    }
    const body = await resp.text()
    if (body != "void") {
        try {
            return JSON.parse(body)
        } catch (err) {
            throw new RexeFetchError("Error while parse json remote execute fetch body", err)
        }
    }
}


