# majotools
![uses npm](https://img.shields.io/npm/v/majotools.svg?style=plastic&logo=npm&color=red)
![uses typescript](https://img.shields.io/badge/dynamic/json?style=plastic&color=blue&label=Typescript&prefix=v&query=devDependencies.typescript&url=https%3A%2F%2Fraw.githubusercontent.com%2FHalsMaulMajo%2Fmajotools%2Fmain%2Fpackage.json)
![uses github](https://img.shields.io/badge/dynamic/json?style=plastic&color=darkviolet&label=GitHub&prefix=v&query=version&url=https%3A%2F%2Fraw.githubusercontent.com%2FHalsMaulMajo%2Fmajotools%2Fmain%2Fpackage.json)

![](https://img.shields.io/badge/dynamic/json?color=darkred&label=open%20issues&query=open_issues&suffix=x&url=https%3A%2F%2Fapi.github.com%2Frepos%2FHalsMaulMajo%2Fmajotools)
![](https://img.shields.io/badge/dynamic/json?color=navy&label=forks&query=forks&suffix=x&url=https%3A%2F%2Fapi.github.com%2Frepos%2FHalsMaulMajo%2Fmajotools)
![](https://img.shields.io/badge/dynamic/json?color=green&label=subscribers&query=subscribers_count&suffix=x&url=https%3A%2F%2Fapi.github.com%2Frepos%2FHalsMaulMajo%2Fmajotools)

# table of contents
- [majotools](#majotools)
- [table of contents](#table-of-contents)
- [about](#about)
- [getting started](#getting-started)
- [examples](#examples)
  - [number functions](#number-functions)
  - [json types and function](#json-types-and-function)
  - [runtime environment](#runtime-environment)
  - [ip functions](#ip-functions)
  - [http status and methods](#http-status-and-methods)
- [contribution](#contribution)

# about
This library provides constants, types, function, interfaces and classes for node and dom interpreters.  
Rules for library content:
- Content should not depend on other packages.

# getting started

```sh
npm i majotools
```

# examples

## number functions
```ts
export function isAlphaNumericCharCode(charCode: number): boolean
export function isUppercaseAlphabeticCharCode(charCode: number): boolean
export function isLowercaseAlphabeticCharCode(charCode: number): boolean
export function isNumericCharCode(charCode: number): boolean
```

## json types and function
```ts
export type JsonBase = boolean | number | string | null // Json primitive types
export type JsonHolder = JsonArray | JsonObject // A json object or array
export type JsonArray = Array<JsonTypes> // A array with just json type values
export type JsonObject = ObjectType<JsonTypes> // A object with just json type values
export type JsonTypes = JsonBase | JsonHolder // Can be every json type

export interface ObjectType<V> { // Object that holds the generec type as values
    [key: string]: V
}

export function polishValues<T extends JsonHolder>(
    holder: T,
    recursive: boolean = true
    ): T
```

## runtime environment
```ts
export function runtimeEnvironment(): "browser" | "electron" | "node" | "unknown"
```

## ip functions
```ts
export function isIp(string: string): boolean 
export function isIpv4(string: string): boolean
export function isIpv6(string: string): boolean
```


## http status and methods
```ts
export function isHttpMethod(method: string): boolean
export function getStatusByReason(reason: string): HttpStatus | null
export function getStatusByCode(code: number): HttpStatus
// and some more...
```

# contribution
 - 1. fork the project
 - 2. implement your idea
 - 3. create a pull/merge request
```ts
// please create seperated forks for different kind of featues/ideas/structure changes/implementations
```

---
**cya ;3**  
*by HalsMaulMajo*