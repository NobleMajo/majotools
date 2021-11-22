
// STRING
export function replaceAll(string: string, search: string | string[] | number | number[], replacement: string | number = ""): string {
    if (Array.isArray(search)) {
        for (let index = 0; index < search.length; index++) {
            string = replaceAll(string, search[index], replacement)
        }
    } else {
        if (typeof search == "number") {
            search = String.fromCharCode(search)
        }
        if (typeof replacement == "number") {
            replacement = String.fromCharCode(replacement)
        }
        string = string.split(search).join(replacement)
    }
    return string
}

export function isAlphaNumericCharCode(charCode: number): boolean {
    return (charCode > 47 && charCode < 58) ||
        (charCode > 64 && charCode < 91) ||
        (charCode > 96 && charCode < 123)
}

export function isUppercaseAlphabeticCharCode(charCode: number): boolean {
    return (charCode > 64 && charCode < 91)
}

export function isLowercaseAlphabeticCharCode(charCode: number): boolean {
    return (charCode > 96 && charCode < 123)
}

export function isNumericCharCode(charCode: number): boolean {
    return (charCode > 47 && charCode < 58)
}

export function simplify(string: string, baseReplacement: string | number = 45): string {
    string = string.toLowerCase()
    let charCode: number
    const replace: number[] = []
    for (let index = 0; index < string.length; index++) {
        charCode = string.charCodeAt(index)
        if (!isLowercaseAlphabeticCharCode(charCode) && !isNumericCharCode(charCode)) {
            replace.push(charCode)
        }
    }
    string = replaceAll(string, replace, 45)
    while (string.includes("--")) {
        string = replaceAll(string, "--", 45)
    }
    if (string.charCodeAt(0) == 45) {
        string = string.slice(1)
    }
    if (string.charCodeAt(string.length - 1) == 45) {
        string = string.slice(0, string.length - 1)
    }
    string = replaceAll(string, 45, baseReplacement)

    return string
}

// JSON
export type JsonBase = boolean | number | string | null // Json primitive types
export type JsonHolder = JsonArray | JsonObject // A json object or array
export type JsonArray = Array<JsonTypes> // A array with just json type values
export type JsonObject = ObjectType<JsonTypes> // A object with just json type values
export type JsonTypes = JsonBase | JsonHolder // Can be every json type

export interface ObjectType<V> { // Object that holds the generec type as values
    [key: string]: V
}

/**
 * 
 * @param holder A json object or array.
 * @param recursive A boolean that enable recursive polishing inside of the holder value/sub values.
 * @description Convert each numeric string to a number value and true/false to a boolean. 
 * @returns The polished holder vobject or array
 */
export function polishValues<T extends JsonHolder>(holder: T, recursive: boolean = true): T {
    if (Array.isArray(holder)) {
        const jsonArray: JsonArray = holder as JsonArray
        for (let index = 0; index < jsonArray.length; index++) {
            const value = jsonArray[index]
            if (typeof value == "string" && value.length > 0) {
                if (!isNaN(value as any)) {
                    jsonArray[index] = Number(value)
                } else if (value.toLowerCase() == "true") {
                    jsonArray[index] = true
                } else if (value.toLowerCase() == "false") {
                    jsonArray[index] = false
                }
            } else if (recursive && typeof value == "object" && value != null) {
                jsonArray[index] = polishValues(value)
            }
        }
    } else {
        const jsonObject: JsonObject = holder as JsonObject
        const keys = Object.keys(jsonObject)
        for (let index = 0; index < keys.length; index++) {
            const key = keys[index];
            const value = jsonObject[key]
            if (typeof value == "string" && value.length > 0) {
                if (!isNaN(value as any)) {
                    jsonObject[key] = Number(value)
                } else if (value.toLowerCase() == "true") {
                    jsonObject[key] = true
                } else if (value.toLowerCase() == "false") {
                    jsonObject[key] = false
                }
            } else if (recursive && typeof value == "object" && value != null) {
                jsonObject[key] = polishValues(value)
            }
        }
    }

    return holder
}

// RUNTIME ENVIRONMENT
let environmentCache: "browser" | "electron" | "node" | "unknown" | null = null

/**
 * 
 * @description Cache and return the type of the runtime environment.
 * @returns Some of this string values "browser", "electron", "node" or "unknown"
 */
export function runtimeEnvironment(): "browser" | "electron" | "node" | "unknown" {
    if (environmentCache != null) {
        return environmentCache
    }
    if (typeof window != "undefined" && typeof document != "undefined" && typeof navigator != "undefined") {
        //frontend
        if (navigator.userAgent.toLowerCase().includes("electron")) {
            //electron
            return environmentCache = "electron"
        } else {
            //browser
            return environmentCache = "browser"
        }
    } else if (typeof process === "object") {
        //node
        return environmentCache = "node"
    } else {
        //unknown
        return environmentCache = "unknown"
    }
}

// LOOP
export type LoopFunc<T> = (res: (value: T | Promise<T>) => void, rej: (reason?: any) => void, delay: (delay: number) => void) => T | Promise<T> | void

export interface Loop<T> {
    res: Promise<T | null>,
    stop: () => void,
    stopped: () => boolean
}

/**
 * 
 * @param loopFunc A function that is executed in a loop
 * @param delay Loop delay / function execute interval
 * @description Executes a function with a specified delay. Can be used to execute something in a interval and create a value or execute a task. Support async functions and Promises.
 * @returns A loop that can be stopped, checked if is stopped and a Promise that can returns the produced value. 
 */
export function loop<T>(loopFunc: LoopFunc<T>, delay: number): Loop<T> {
    let stop = false
    return {
        stop: (): void => {
            stop = true
        },
        stopped: (): boolean => {
            return stop
        },
        res: new Promise<T | null>((res, rej) => {
            const res2 = (value: T | Promise<T>): void => {
                stop = true
                if (value instanceof Promise) {
                    (async () => res(await value))()
                } else {
                    res(value)
                }
            }

            const rej2 = (reason?: any): void => {
                stop = true
                rej(reason)
            }

            const delay2 = async (d: number): Promise<void> => {
                delay = d
            }

            const loop = () => {
                let value: T | Promise<T> | void = loopFunc(res2, rej2, delay2)
                if (value != null) {
                    if (value instanceof Promise) {
                        value
                            .then((value) => res(value))
                            .catch((err) => rej(err))
                    } else {
                        res(value)
                    }
                }

                if (!stop) {
                    setTimeout(() => loop(), delay)
                } else {
                    res(null)
                }
            }

            setTimeout(() => loop(), delay)
        })
    }
}

// PLAN
export interface PlanOptions<T> {
    id: string
    delay: number
    value: T,
    func?: (value: T, id: string) => void
    last?: number
}

export interface Plan<T> extends PlanOptions<T> {
    id: string
    delay: number
    func: (value: T, id: string) => void
    value: T
    last: number
}

export type Plans = {
    [id: string]: Plan<any>
}

const plans: Plans = {}
/**
 * 
 * @param options Options to configure a timed plan
 * @description Execute a function in the delay(ms) interval and if this plan function is executed. You can pass a value to the function by the value options. This funciton is used to debug valued inside of very fast loops. You dont spam/overload the console by setting the delay to 2000ms(=2s) and print a value. 
 * @returns A Plan that contains the id, function, delay, last value and last execute
 */
export function plan<T>(options: PlanOptions<T>): Plan<T> {
    const plan: Plan<T> = {
        ...plans[options.id] ?
            plans[options.id] :
            {
                func: (value: T, id: string) => console.log(id + ": ", value),
                last: 0
            },
        ...options
    }
    const now = Date.now()
    if (now > plan.last + plan.delay) {
        plan.last = Date.now()
        plan.func(plan.value, plan.id)
    }

    setTimeout(() => {
        if (plans[options.id].delay == now) {
            delete plans[options.id]
        }
    }, plan.delay * 1.1 + 4)

    return plans[options.id] = plan
}

// IP
export function isIp(string: string): boolean {
    return /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/.test(string)
}

export function isIpv4(string: string): boolean {
    return /^([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\\.([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\\.([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\\.([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])$/g.test(string)
}

export function isIpv6(string: string): boolean {
    return /^((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*::((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*|((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4})){7}$/g.test(string);
}

// ENDPOINT
export interface EndPoint {
    address: string,
    port: number
}

export function getIdByEndpoint(endpoint: EndPoint): string {
    return endpoint.address + ":" + endpoint.port
}

export function getEndpointById(id: string): EndPoint {
    const seperatorIndex = id.lastIndexOf(":")
    return {
        address: id.substring(0, seperatorIndex),
        port: Number(id.substring(seperatorIndex + 1))
    }
}

// HTTP
export const statusCodeMap: { [key: number]: HttpStatus } = {
    '100': { code: 100, message: 'Continue', simple: 'continue' },
    '101': {
        code: 101,
        message: 'Switching Protocol',
        simple: 'switching-protocol'
    },
    '102': { code: 102, message: 'Processing', simple: 'processing' },
    '103': { code: 103, message: 'Early Hints', simple: 'early-hints' },
    '200': { code: 200, message: 'OK', simple: 'ok' },
    '201': { code: 201, message: 'Created', simple: 'created' },
    '202': { code: 202, message: 'Accepted', simple: 'accepted' },
    '203': {
        code: 203,
        message: 'Non-Authoritative Information',
        simple: 'non-authoritative-information'
    },
    '204': { code: 204, message: 'No Content', simple: 'no-content' },
    '205': { code: 205, message: 'Reset Content', simple: 'reset-content' },
    '206': { code: 206, message: 'Partial Content', simple: 'partial-content' },
    '207': { code: 207, message: 'Multi-Status', simple: 'multi-status' },
    '208': {
        code: 208,
        message: 'Already Reported',
        simple: 'already-reported'
    },
    '226': { code: 226, message: 'IM Used', simple: 'im-used' },
    '300': { code: 300, message: 'Multiple Choice', simple: 'multiple-choice' },
    '301': {
        code: 301,
        message: 'Moved Permanently',
        simple: 'moved-permanently'
    },
    '302': { code: 302, message: 'Found', simple: 'found' },
    '303': { code: 303, message: 'See Other', simple: 'see-other' },
    '304': { code: 304, message: 'Not Modified', simple: 'not-modified' },
    '305': { code: 305, message: 'Use Proxy', simple: 'use-proxy' },
    '306': { code: 306, message: 'unused', simple: 'unused' },
    '307': {
        code: 307,
        message: 'Temporary Redirect',
        simple: 'temporary-redirect'
    },
    '308': {
        code: 308,
        message: 'Permanent Redirect',
        simple: 'permanent-redirect'
    },
    '400': { code: 400, message: 'Bad Request', simple: 'bad-request' },
    '401': { code: 401, message: 'Unauthorized', simple: 'unauthorized' },
    '402': {
        code: 402,
        message: 'Payment Required',
        simple: 'payment-required'
    },
    '403': { code: 403, message: 'Forbidden', simple: 'forbidden' },
    '404': { code: 404, message: 'Not Found', simple: 'not-found' },
    '405': {
        code: 405,
        message: 'Method Not Allowed',
        simple: 'method-not-allowed'
    },
    '406': { code: 406, message: 'Not Acceptable', simple: 'not-acceptable' },
    '407': {
        code: 407,
        message: 'Proxy Authentication Required',
        simple: 'proxy-authentication-required'
    },
    '408': { code: 408, message: 'Request Timeout', simple: 'request-timeout' },
    '409': { code: 409, message: 'Conflict', simple: 'conflict' },
    '410': { code: 410, message: 'Gone', simple: 'gone' },
    '411': { code: 411, message: 'Length Required', simple: 'length-required' },
    '412': {
        code: 412,
        message: 'Precondition Failed',
        simple: 'precondition-failed'
    },
    '413': {
        code: 413,
        message: 'Payload Too Large',
        simple: 'payload-too-large'
    },
    '414': { code: 414, message: 'URI Too Long', simple: 'uri-too-long' },
    '415': {
        code: 415,
        message: 'Unsupported Media Type',
        simple: 'unsupported-media-type'
    },
    '416': {
        code: 416,
        message: 'Range Not Satisfiable',
        simple: 'range-not-satisfiable'
    },
    '417': {
        code: 417,
        message: 'Expectation Failed',
        simple: 'expectation-failed'
    },
    '418': { code: 418, message: "I'm a teapot", simple: 'i-m-a-teapot' },
    '421': {
        code: 421,
        message: 'Misdirected Request',
        simple: 'misdirected-request'
    },
    '422': {
        code: 422,
        message: 'Unprocessable Entity',
        simple: 'unprocessable-entity'
    },
    '423': { code: 423, message: 'Locked', simple: 'locked' },
    '424': {
        code: 424,
        message: 'Failed Dependency',
        simple: 'failed-dependency'
    },
    '425': { code: 425, message: 'Too Early', simple: 'too-early' },
    '426': {
        code: 426,
        message: 'Upgrade Required',
        simple: 'upgrade-required'
    },
    '428': {
        code: 428,
        message: 'Precondition Required',
        simple: 'precondition-required'
    },
    '429': {
        code: 429,
        message: 'Too Many Requests',
        simple: 'too-many-requests'
    },
    '431': {
        code: 431,
        message: 'Request Header Fields Too Large',
        simple: 'request-header-fields-too-large'
    },
    '451': {
        code: 451,
        message: 'Unavailable For Legal Reasons',
        simple: 'unavailable-for-legal-reasons'
    },
    '500': {
        code: 500,
        message: 'Internal Server Error',
        simple: 'internal-server-error'
    },
    '501': { code: 501, message: 'Not Implemented', simple: 'not-implemented' },
    '502': { code: 502, message: 'Bad Gateway', simple: 'bad-gateway' },
    '503': {
        code: 503,
        message: 'Service Unavailable',
        simple: 'service-unavailable'
    },
    '504': { code: 504, message: 'Gateway Timeout', simple: 'gateway-timeout' },
    '505': {
        code: 505,
        message: 'HTTP Version Not Supported',
        simple: 'http-version-not-supported'
    },
    '506': {
        code: 506,
        message: 'Variant Also Negotiates',
        simple: 'variant-also-negotiates'
    },
    '507': {
        code: 507,
        message: 'Insufficient Storage',
        simple: 'insufficient-storage'
    },
    '508': { code: 508, message: 'Loop Detected', simple: 'loop-detected' },
    '510': { code: 510, message: 'Not Extended', simple: 'not-extended' },
    '511': {
        code: 511,
        message: 'Network Authentication Required',
        simple: 'network-authentication-required'
    }
}

export const statusCodeList: HttpStatus[] = Object.values(statusCodeMap)

export type LowerHttpMethods = "get" | "post" | "put" | "delete" | "trace" | "connect" | "head" | "options" | "patch"
export type UpperHttpMethods = "GET" | "POST" | "PUT" | "DELETE" | "TRACE" | "CONNECT" | "HEAD" | "OPTIONS" | "PATCH"
export type HttpMethods = LowerHttpMethods | UpperHttpMethods
export const httpMethods = ["get", "post", "put", "delete", "trace", "connect", "head", "options", "patch"]

export interface HttpHeader {
    [key: string]: string | string[]
}

export interface HttpStatus {
    code: number,
    message: string,
    simple: string
}

export function getLowerHttpMethod(methods: HttpMethods): LowerHttpMethods {
    return methods.toLowerCase() as LowerHttpMethods
}

export function getUpperHttpMethod(methods: HttpMethods): UpperHttpMethods {
    return methods.toUpperCase() as UpperHttpMethods
}

export function isHttpMethod(method: string): boolean {
    return httpMethods.includes(method.toLowerCase())
}

export function splitHeader(allHeader: string | null | undefined): HttpHeader {
    if (!allHeader) {
        return {}
    }
    const header: HttpHeader = {}
    allHeader.trim().split(/[\r\n]+/).forEach(function (line) {
        const parts: string[] = line.split(': ')
        const key = parts.shift()
        if (key) {
            if (Array.isArray(header[key])) {
                (header[key] as string[]).push(parts.join(': '))
            } else if (typeof header[key] == "string") {
                header[key] = [header[key] as string, parts.join(': ')]
            } else {
                header[key] = parts.join(': ')
            }
        }
    })
    return header
}

export function getStatusByReason(reason: string): HttpStatus | null {
    const simple = simplify(reason)
    for (let index = 0; index < statusCodeList.length; index++) {
        if (statusCodeList[index].simple == simple) {
            return statusCodeList[index]
        }
    }
    return null
}

export function getStatusByCode(code: number): HttpStatus {
    if (statusCodeMap[code]) {
        return statusCodeMap[code]
    }

    if (code >= 100 && code < 200) {
        return { code: 100, message: 'Continue', simple: 'continue' }
    } else if (code >= 200 && code < 300) {
        return { code: 200, message: 'OK', simple: 'ok' }
    } else if (code >= 300 && code < 400) {
        return { code: 300, message: 'Multiple Choice', simple: 'multiple choice' }
    } else if (code >= 400 && code < 500) {
        return { code: 400, message: 'Bad Request', simple: 'bad request' }
    } else if (code >= 500 && code < 600) {
        return {
            code: 500,
            message: 'Internal Server Error',
            simple: 'internal server error'
        }

    } else {
        return {
            code: code,
            message: "Unknown",
            simple: "unknown"
        }
    }
}