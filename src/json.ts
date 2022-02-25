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
export function polishValues<T extends JsonHolder>(
    holder: T,
    recursive: boolean = true
): T {
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