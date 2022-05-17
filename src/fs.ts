import { promises as fs, statSync, watch } from "fs"
import * as path from "path"
import * as os from "os"
import { VarInputStream, VarStream } from "./varstream"
import { JsonTypes } from "./json"
import {
    absolutPath,
    matchPathSelector,
    PathSelector,
    toLinuxPath
} from "pathsfilter"

export interface PathStat {
    name: string,
    relativePath: string,
    rootPath: string,
    isFile: boolean,
    isDir: boolean,
}

export interface RecursivePathStatChildren {
    [name: string]: RecursivePathStat
}

export interface RecursivePathStat extends PathStat {
    children: RecursivePathStatChildren
    parent: RecursivePathStat | undefined
}

export interface ExtendedDirScanOptions {
    depth?: number
    cwd?: string
    pathSelector?: PathSelector,
    matchByDefault?: boolean
    current?: RecursivePathStat,
    parent?: RecursivePathStat
}

export interface ExtendedDirScanSettings {
    depth: number
    cwd: string
    pathSelector: PathSelector | undefined,
    matchByDefault: boolean
    current: RecursivePathStat | undefined,
    parent: RecursivePathStat | undefined
}

export const defaultExtendedDirScanSettings: ExtendedDirScanSettings = {
    depth: 5,
    cwd: process.cwd(),
    pathSelector: undefined,
    matchByDefault: false,
    current: undefined,
    parent: undefined
}

export async function extendedDirScan(
    path: string,
    options?: ExtendedDirScanOptions
): Promise<RecursivePathStat> {
    const settings: ExtendedDirScanSettings = {
        ...defaultExtendedDirScanSettings,
        ...options,
    }
    path = toLinuxPath(path)
    let current: RecursivePathStat
    if (!settings.current) {
        const stat = await fs.stat(path)
        current = {
            name: path.split("/").pop() as string,
            rootPath: absolutPath(path, settings.cwd),
            relativePath: path,
            isFile: stat.isFile(),
            isDir: stat.isDirectory(),
            children: {},
            parent: settings.parent
        }
    } else {
        current = settings.current
    }
    if (settings.parent) {
        settings.parent.children[current.name] = current
    }
    if (current.isDir && settings.depth > 0) {
        const files = await fs.readdir(
            path,
            {
                encoding: "utf-8",
                withFileTypes: true,
            }
        )
        await Promise.all(files.map(
            async (file) => {
                const childPath = path + "/" + file.name
                if (settings.pathSelector) {
                    if (
                        !matchPathSelector(
                            childPath,
                            settings.pathSelector,
                            settings.matchByDefault
                        )
                    ) {
                        return
                    }
                }
                const child: RecursivePathStat = {
                    name: file.name,
                    rootPath: absolutPath(childPath, settings.cwd),
                    relativePath: childPath,
                    isFile: file.isFile(),
                    isDir: file.isDirectory(),
                    children: {},
                    parent: settings.current,
                }
                await extendedDirScan(
                    childPath,
                    {
                        ...settings,
                        depth: settings.depth - 1,
                        current: child,
                        parent: current
                    }
                )
            }
        ))
    }
    return current
}

export function parseRecursiveFilelist(
    recursivePathStat: RecursivePathStat,
): string[] {
    const result: string[] = []
    if (recursivePathStat.isFile) {
        result.push(recursivePathStat.relativePath)
    } else if (recursivePathStat.isDir) {
        Object.values(recursivePathStat.children).forEach(
            (v) => parseRecursiveFilelist(v).forEach(
                (v) => result.push(v)
            )
        )
    }
    return result
}

export function parseAbsoluteRecursiveFilelist(
    recursivePathStat: RecursivePathStat,
    cwd: string = process.cwd()
): string[] {
    return parseRecursiveFilelist(recursivePathStat).map(
        (v) => absolutPath(
            v,
            cwd
        )
    )

}

export function toAbsolutePath(
    filePath: string,
    cwd: string = process.cwd()
): string {
    filePath = filePath.split("\\").join("/")
    if (os.platform() == "win32") {
        if (filePath[1] != ":" && filePath[2] != "/") {
            if (!filePath.startsWith("/")) {
                filePath = "/" + filePath
            }
            filePath = cwd + filePath
        }
    } else if (!filePath.startsWith("/")) {
        filePath = cwd + "/" + filePath
    }
    while (filePath.includes("//")) {
        filePath = filePath.split("//").join("/")
    }
    return path.normalize(filePath)
}

export async function getFileType(filePath: string): Promise<"FILE" | "DIR" | "NONE"> {
    try {
        const stat = await fs.stat(filePath)
        if (stat.isDirectory()) {
            return "DIR"
        } else if (stat.isFile()) {
            return "FILE"
        } else {
            return "NONE"
        }
    } catch (error) {
        return "NONE"
    }
}

export function getFileTypeSync(filePath: string): "FILE" | "DIR" | "NONE" {
    try {
        const state = statSync(filePath)
        if (state.isDirectory()) {
            return "DIR"
        } else if (state.isFile()) {
            return "FILE"
        } else {
            return "NONE"
        }
    } catch (error) {
        return "NONE"
    }
}

export async function readJson(
    filePath: string,
    encoding: BufferEncoding = "utf8"
): Promise<JsonTypes> {
    return JSON.parse(await fs.readFile(
        filePath,
        {
            encoding: encoding
        }
    ).toString())
}

export async function writeJson(
    filePath: string,
    data: JsonTypes,
    pretty: boolean = true,
    encoding: BufferEncoding = "utf8"
): Promise<void> {
    return await fs.writeFile(
        filePath,
        pretty ? JSON.stringify(data, null, 4) : JSON.stringify(data),
        { encoding: encoding }
    )
}

export function watchChanges(
    filePath: string
): VarInputStream<string> {
    const varstream = new VarStream<string>()
    getFileType(filePath).then((type) => {
        if (varstream.isClosed()) {
            return
        }
        if (type == "NONE") {
            throw new Error("Can't watch something that not exists!")
        }
        const watcher = watch(
            filePath,
            {
                recursive: type == "DIR",
                persistent: false
            },
            (type, file) => varstream.write(file, {
                type: type,
                in: filePath,

            })
        )
        watcher.on("error", (err: Error | any) => varstream.end(err))
        watcher.on("close", () => varstream.end())
        varstream.finally(() => watcher.close())
    })
    return varstream.getInputVarStream()
}


