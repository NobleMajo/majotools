export function isClass(value: any): boolean {
    if (
        typeof value !== "function" ||
        typeof value.toString !== "function"
    ) {
        return false
    }
    if (value.toString().substring(0, 5) === "class") {
        return true
    }
    if (
        typeof value.prototype === "object" &&
        typeof value.prototype.constructor === "function" &&
        typeof value.prototype.constructor.toString === "function"
    ) {
        if (value.toString().substring(0, 5) === "class") {
            return true
        }
        const props = Object.getOwnPropertyNames(value.prototype)
        if (
            props[0] === "constructor" &&
            props[1] === undefined
        ) {
            const conProps = Object.getOwnPropertyNames(value.prototype.constructor)
            if (
                conProps[0] === "length" &&
                conProps[1] === "name" &&
                conProps[2] === undefined

            ) {
                return false
            }
            if (
                conProps[0] === "length" &&
                conProps[1] === "name" &&
                conProps[2] === "prototype" &&
                conProps[3] === undefined
            ) {
                return false
            }
        }
        return true
    }
    return false
}

export function isClassInstance(value): boolean {
    if (
        value == null ||
        typeof value !== "object"
    ) {
        return false
    }
    return typeof value.constructor.name === "string" &&
        value.constructor.name.length > 0 &&
        value.constructor.name !== "Object"
}

export function isAnonymInstance(value): boolean {
    if (
        value == null ||
        typeof value !== "object"
    ) {
        return false
    }
    return value.constructor.name === "Object"
}