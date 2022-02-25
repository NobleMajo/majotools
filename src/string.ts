
export function removeWhileStartsWith(
    source: string,
    ...searchPrefixs: string[]
): string {
    for (let index = 0; index < searchPrefixs.length; index++) {
        if (source.startsWith(searchPrefixs[index])) {
            source = source.substring(searchPrefixs[index].length)
            index = 0
        }
    }
    return source
}

export function removeWhileEndsWith(
    source: string,
    ...searchPrefixs: string[]
): string {
    for (let index = 0; index < searchPrefixs.length; index++) {
        if (source.endsWith(searchPrefixs[index])) {
            source = source.slice(0, -searchPrefixs[index].length)
            index = 0
        }
    }
    return source
}

export function splitAndClean(
    source: string,
    splitSearch: string,
    ...cleanWrappingValues: string[]
): string[] {
    return source.split(splitSearch)
        .filter((v) => v.length > 0)
        .map((v) => removeWhileStartsWith(v, ...cleanWrappingValues))
        .filter((v) => v.length > 0)
        .map((v) => removeWhileEndsWith(v, ...cleanWrappingValues))
        .filter((v) => v.length > 0)
}

export function allToString(value: any): string {
    return value && typeof value.toString == "function" ?
        value.toString() :
        "" + value
}

export function replaceAll(
    string: string,
    search: string | string[] | number | number[],
    replacement: string | number = "",
): string {
    if (Array.isArray(search)) {
        for (let index = 0; index < search.length; index++) {
            string = replaceAll(string, search[index], replacement)
        }
        return string
    } else {
        if (typeof search == "number") {
            search = String.fromCharCode(search)
        }
        if (typeof replacement == "number") {
            replacement = String.fromCharCode(replacement)
        }
        return string
            .split(search)
            .join(replacement)
    }
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

