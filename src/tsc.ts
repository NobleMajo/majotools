import { ShellOptions } from './shell';
import { NodeOptions, node } from './node';
import { LogType } from './varstream';

export type esModule = 'none' | 'commonjs' | 'amd' | 'system' | 'umd' | 'es2015' | 'ESNext'
export type esLib = 'es5' | 'es6' | 'es2015' | 'es7' | 'es2016' | 'es2017' | 'es2018' | 'es2019' | 'es2020' | 'es2021' | 'esnext' | 'dom' | string
export type esTarget = 'es3' | 'es5' | 'es6' | 'es2015' | 'es2016' | 'es2017' | 'es2018' | 'es2019' | 'es2020' | 'es2021' | 'esnext' | string

export type ExecuterOptions = NodeOptions & ShellOptions

export interface CompileOptions extends ExecuterOptions {
    forkNode?: boolean
    inFile?: string,
    project?: string,
    outDir?: string | boolean,
    outFile?: string | boolean,
    clean?: boolean,
    force?: boolean,
    dry?: boolean,
    verbose?: boolean,
    diagnostics?: boolean,
    module?: esModule | string,
    allowJs?: boolean,
    checkJs?: boolean,
    removeComments?: boolean,
    sourceMap?: boolean,
    declarationMap?: boolean,
    pretty?: boolean,
    emitDeclarationOnly?: boolean,
    esModuleInterop?: boolean,
    strict?: boolean,
    listFiles?: boolean,
    listEmittedFiles?: boolean,
    declaration?: boolean,
    noEmit?: boolean,
    libs?: esLib[],
    args?: string[],
    target?: esTarget,
    tsCompilePath?: string,
    tsSuffix?: string,
    jsSuffix?: string,
}

export interface CompileSettings extends CompileOptions {
    inFile: string | undefined,
    project: string | undefined,
    outDir: string | boolean,
    outFile: string | boolean,
    clean: boolean,
    force: boolean,
    dry: boolean,
    verbose: boolean,
    diagnostics: boolean,
    module: esModule | string | undefined,
    allowJs: boolean | undefined,
    checkJs: boolean | undefined,
    removeComments: boolean | undefined,
    sourceMap: boolean | undefined,
    declarationMap: boolean | undefined,
    pretty: boolean | undefined,
    emitDeclarationOnly: boolean | undefined,
    esModuleInterop: boolean | undefined,
    strict: boolean | undefined,
    listFiles: boolean | undefined,
    listEmittedFiles: boolean | undefined
    declaration: boolean | undefined,
    noEmit: boolean | undefined,
    libs: (esLib | string)[],
    args: string[],
    target: esTarget | undefined,
    tsCompilePath: string,
    tsSuffix: string,
    jsSuffix: string,
}

export const defaultCompileSettings: CompileSettings = {
    inFile: undefined,
    project: undefined,
    outDir: false,
    outFile: false,
    clean: false,
    force: false,
    dry: false,
    verbose: false,
    diagnostics: false,
    module: undefined,
    allowJs: undefined,
    checkJs: undefined,
    removeComments: undefined,
    sourceMap: undefined,
    declarationMap: undefined,
    pretty: undefined,
    emitDeclarationOnly: undefined,
    esModuleInterop: undefined,
    strict: undefined,
    listFiles: undefined,
    listEmittedFiles: undefined,
    declaration: undefined,
    noEmit: undefined,
    libs: [],
    args: [],
    target: undefined,
    tsCompilePath: "node_modules/typescript/bin/tsc",
    tsSuffix: ".ts",
    jsSuffix: ".js",
}

export function tsc(
    options: CompileOptions,
): VarInputStream<LogType<Buffer>> {
    const settings: CompileSettings = {
        ...defaultCompileSettings,
        ...options
    }
    const args: string[] = []
    if (settings.inFile) {
        args.push(settings.inFile)
    }
    if (settings.project) {
        args.push("--project")
        args.push(settings.project)
    }
    if (settings.module) {
        args.push("--module")
        args.push(settings.module)
    }
    if (typeof settings.outFile != "undefined") {
        if (typeof settings.outFile == "string") {
            args.push("--outFile")
            args.push(settings.outFile)
        } else if (
            settings.outFile == true
        ) {
            if (typeof settings.inFile != "string") {
                throw new Error("You need to set 'inFile' if you use 'outFile'")
            }
            let jsPath = settings.inFile
            if (jsPath.endsWith(settings.tsSuffix)) {
                jsPath = jsPath.slice(0, -3)
            }
            jsPath += settings.jsSuffix
            args.push("--outFile")
            args.push(jsPath)
        }
    }
    if (typeof settings.removeComments == "boolean") {
        args.push("--removeComments")
        args.push("" + settings.removeComments)
    }
    if (typeof settings.sourceMap == "boolean") {
        args.push("--sourceMap")
        args.push("" + settings.sourceMap)
    }
    if (typeof settings.declarationMap == "boolean") {
        args.push("--declarationMap")
        args.push("" + settings.declarationMap)
    }
    if (typeof settings.pretty == "boolean") {
        args.push("--pretty")
        args.push("" + settings.pretty)
    }
    if (typeof settings.esModuleInterop == "boolean") {
        args.push("--esModuleInterop")
        args.push("" + settings.esModuleInterop)
    }
    if (typeof settings.strict == "boolean") {
        args.push("--strict")
        args.push("" + settings.strict)
    }
    if (typeof settings.emitDeclarationOnly == "boolean") {
        args.push("--emitDeclarationOnly")
        args.push("" + settings.emitDeclarationOnly)
    }
    if (typeof settings.noEmit == "boolean") {
        args.push("--noEmit")
        args.push("" + settings.noEmit)
    }
    if (typeof settings.allowJs == "boolean") {
        args.push("--allowJs")
        args.push("" + settings.allowJs)
    }
    if (typeof settings.checkJs == "boolean") {
        args.push("--checkJs")
        args.push("" + settings.checkJs)
    }
    if (typeof settings.listEmittedFiles == "boolean") {
        args.push("--listEmittedFiles")
        args.push("" + settings.listEmittedFiles)
    }
    if (typeof settings.listFiles == "boolean") {
        args.push("--listFiles")
        args.push("" + settings.listFiles)
    }
    if (typeof settings.declaration == "boolean") {
        args.push("--declaration")
        args.push("" + settings.declaration)
    }
    if (settings.clean == true) {
        args.push("--clean")
    }
    if (settings.force == true) {
        args.push("--force")
    }
    if (settings.dry == true) {
        args.push("--dry")
    }
    if (settings.verbose == true) {
        args.push("--verbose")
    }
    if (settings.diagnostics == true) {
        args.push("--diagnostics")
    }
    if (Array.isArray(settings.libs)) {
        settings.libs.forEach((lib: string) => {
            args.push("--lib")
            args.push(lib)
        })
    }
    if (Array.isArray(settings.args)) {
        settings.args.forEach((arg: string) => args.push(arg))
    }
    return node(
        settings.tsCompilePath,
        args,
        options
    )
}

export function rmJsFileByTsFile(
    tsPath: string,
    tsSuffix: string = ".ts",
    jsSuffix: string = ".js"
): Promise<void> {
    return new Promise<void>((res, rej) => {
        if (tsPath.endsWith(tsSuffix)) {
            tsPath = tsPath.slice(0, -3)
        }
        fs.rm(tsPath + jsSuffix, (err) => {
            if (err) {
                return rej(err)
            }
            res()
        })
    })
}

const bin = process.env["_"].toLowerCase()
export const isTsNode: boolean | undefined = bin.includes("tsnode") || bin.includes("ts-node")

export interface TsNodeOptions extends NodeOptions {
    pipeEnv?: boolean,
    timeoutMillis?: number,
    tsNodePath?: string
}

export interface TsNodeSettings extends TsNodeOptions {
    pipeEnv: boolean,
    timeoutMillis: number
    tsNodePath: string
}

export const defaultTsNodeSettings: TsNodeSettings = {
    pipeEnv: false,
    timeoutMillis: defaultCmdTimeout,
    tsNodePath: "node_modules/ts-node/dist/bin.js"
}

export function tsnode(
    script: string,
    args: string[],
    options?: TsNodeOptions
): VarInputStream<LogType<Buffer>> {
    const settings: TsNodeSettings = {
        ...defaultTsNodeSettings,
        ...options,
    }

    if (settings.pipeEnv) {
        settings.env = {
            ...process.env,
            ...settings.env
        }
    }

    return node(
        settings.tsNodePath,
        [
            script,
            ...args
        ],
        settings
    )
}