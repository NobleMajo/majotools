
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

export function allToString(value: any) {
    return typeof value.toString == "function" ?
        value.toString() :
        "" + value
}

