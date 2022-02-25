import { simplify } from './string';

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
export const httpMethods: ["get", "post", "put", "delete", "trace", "connect", "head", "options", "patch"] =
    ["get", "post", "put", "delete", "trace", "connect", "head", "options", "patch"]

export interface HttpHeader {
    [key: string]: undefined | string | string[]
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
    return httpMethods.includes(method.toLowerCase() as any)
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