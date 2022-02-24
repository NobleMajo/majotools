import { CompileOptions, tsc } from './tsc';
import { getFileType } from './fs';

export interface ImportModuleOptions extends CompileOptions {
    tsConfigName?: string | null,
    packageJsonName?: string | null,
    tsExtension?: string | null,
    jsExtension?: string | null,
    jsonExtension?: string | null,
    cwd?: string
}

export interface ImportModuleSettings extends ImportModuleOptions {
    tsConfigName: string | null,
    packageJsonName: string | null,
    tsExtension: string | null,
    jsExtension: string | null,
    jsonExtension: string | null,
    cwd: string
}

export const defaultImportModuleSettings: ImportModuleSettings = {
    tsConfigName: "tsconfig.json",
    packageJsonName: "package.json",
    tsExtension: ".ts",
    jsExtension: ".js",
    jsonExtension: ".json",
    cwd: process.cwd()
}

export async function autoImport(
    importPath: string,
    options?: ImportModuleOptions
): Promise<any> {
    const settings: ImportModuleSettings = {
        ...defaultImportModuleSettings,
        ...options
    }
    if (
        settings.packageJsonName == null &&
        settings.tsConfigName == null &&
        settings.tsExtension == null &&
        settings.jsExtension == null &&
        settings.jsonExtension == null
    ) {
        throw new Error("Can't import anything if 'js', 'ts', 'json', 'package.json' and 'tsconfig.json' are disabled!")
    }
    let del: () => Promise<void> | undefined
    const originPath = importPath

    if (settings.tsConfigName) {
        try {
            if (
                settings.tsConfigName &&
                await getFileType(importPath + "/" + settings.tsConfigName) == "FILE"
            ) {
                let errorLines: string = ""
                const paths = await tsc({
                    ...options,
                    project: toAbsolutePath(importPath + "/" + settings.tsConfigName),
                    listEmittedFiles: true,
                })
                    .spread((logs) => {
                        const logLine = "" + logs[1]
                        return logLine.split("\n").map((v) => {
                            while (v.startsWith(" ")) {
                                v = v.substring(1)
                            }
                            while (v.endsWith(" ")) {
                                v = v.slice(0, -1)
                            }
                            return v.length == 0 ? undefined : v
                        })
                    })
                    .map((line: string) => {
                        if (
                            line.startsWith("TSFILE: ") &&
                            line.endsWith(settings.jsSuffix)
                        ) {
                            return line.substring(8)
                        } else if (line.includes(" error ")) {
                            errorLines += "\n" + line
                        }
                        return undefined
                    })
                    .bufferValues()

                del = () => Promise.all(
                    paths.map((path) => new Promise<void>((res, rej) => fs.rm(
                        path,
                        (err) => err ? rej(err) : res()
                    ))
                    )
                ) as any

                if (paths.length == 0) {
                    if (errorLines.length > 0) {
                        throw new Error("TypeScript Type Errors:" + errorLines)
                    } else {
                        throw new Error("Unknown TypeScript Compile Error!")
                    }
                }
            }
            return require(formatPath(packageData.main, modulePath))
        } finally {
            if (del) {
                await del()
            }
        }
    }

    if (settings.packageJsonName) {
        try {
            const packageJSON = require(
                toAbsolutePath(
                    settings.packageJsonName,
                    settings.cwd
                )
            )
            importPath = toAbsolutePath(
                settings.packageJsonName,
                settings.cwd
            )
            packageJSON.main
        } catch (err) {

        }

    }


    if (settings.allowJson) {
        if (
            modulePath.endsWith(settings.jsonSuffix) &&
            await getFileType(modulePath) == "FILE"
        ) {
            return require(modulePath)
        } else if (
            await getFileType(modulePath + settings.jsonSuffix) == "FILE"
        ) {
            return require(modulePath)
        }
    }
    let type = await getFileType(modulePath)
    if (type == "DIR") {
        if (!settings.importPackageJson) {
            throw new Error("Can't import package folder if 'importPackageJson' it set to 'false'!")
        } else if (await getFileType(modulePath + "/" + settings.packageJsonName) != "FILE") {
            throw new Error("Can't find '" + modulePath + "/" + settings.packageJsonName + "'!")
        }
        const packageData = require(modulePath + "/" + settings.packageJsonName)
        let del: () => Promise<void> | undefined
        try {
            if (
                settings.compileTs &&
                await getFileType(modulePath + "/" + settings.tsConfigName) == "FILE"
            ) {
                let errorLines: string = ""
                const paths = await tsc({
                    ...options,
                    project: modulePath + "/" + settings.tsConfigName,
                    listEmittedFiles: true,
                })
                    .spread((logs) => {
                        const logLine = "" + logs[1]
                        return logLine.split("\n").map((v) => {
                            while (v.startsWith(" ")) {
                                v = v.substring(1)
                            }
                            while (v.endsWith(" ")) {
                                v = v.slice(0, -1)
                            }
                            return v.length == 0 ? undefined : v
                        })
                    })
                    .map((line: string) => {
                        if (
                            line.startsWith("TSFILE: ") &&
                            line.endsWith(settings.jsSuffix)
                        ) {
                            return line.substring(8)
                        } else if (line.includes(" error ")) {
                            errorLines += "\n" + line
                        }
                        return undefined
                    })
                    .bufferValues()

                if (settings.deleteCompiledFiles) {
                    del = () => Promise.all(
                        paths.map((path) => new Promise<void>((res, rej) => fs.rm(
                            path,
                            (err) => err ? rej(err) : res()
                        ))
                        )
                    ) as any
                }

                if (paths.length == 0) {
                    if (errorLines.length > 0) {
                        throw new Error("TypeScript Type Errors:" + errorLines)
                    } else {
                        throw new Error("Unknown TypeScript Compile Error!")
                    }
                }
            }
            return require(formatPath(packageData.main, modulePath))
        } finally {
            if (del) {
                await del()
            }
        }
    } else {
        if (!settings.importSingleFile) {
            throw new Error("Can't import '" + modulePath + "' because it is not a folder!")
        }
        if (modulePath.endsWith(settings.tsSuffix)) {
            modulePath = modulePath.slice(0, -settings.tsSuffix.length)
        } else if (modulePath.endsWith(settings.jsSuffix)) {
            modulePath = modulePath.slice(0, -settings.jsSuffix.length)
        }
        let del: () => Promise<void> | undefined
        try {
            if (settings.compileTs && await getFileType(modulePath + settings.tsSuffix) == "FILE") {
                let errorLines: string = ""
                const paths = await tsc({
                    ...options,
                    inFile: modulePath + settings.tsSuffix,
                    listEmittedFiles: true,
                })
                    .spread((logs) => {
                        const logLine = "" + logs[1]
                        return logLine.split("\n").map((v) => {
                            while (v.startsWith(" ")) {
                                v = v.substring(1)
                            }
                            while (v.endsWith(" ")) {
                                v = v.slice(0, -1)
                            }
                            return v.length == 0 ? undefined : v
                        })
                    })
                    .map((line: string) => {
                        if (
                            line.startsWith("TSFILE: ") &&
                            line.endsWith(settings.jsSuffix)
                        ) {
                            return line.substring(8)
                        } else if (line.includes(" error ")) {
                            errorLines += "\n" + line
                        }
                        return undefined
                    })
                    .bufferValues()
                if (settings.deleteCompiledFiles) {
                    del = () => Promise.all(
                        paths.map((path) => new Promise<void>(
                            (res, rej) => fs.rm(
                                path,
                                (err) => err ? rej(err) : res()
                            )
                        ))
                    ) as any
                }

                if (paths.length == 0) {
                    if (errorLines.length > 0) {
                        throw new Error("TypeScript Type Errors:" + errorLines)
                    } else {
                        throw new Error("Unknown TypeScript Compile Error!")
                    }
                }
            }
            if (await getFileType(modulePath + settings.jsSuffix) != "FILE") {
                throw new Error("File '" + modulePath + settings.jsSuffix + "' not found!")
            }
            return require(formatPath(modulePath + settings.jsSuffix))
        } finally {
            if (del) {
                await del()
            }
        }
    }
}
