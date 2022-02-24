import * as fs from "fs"
import * as path from "path"
import * as os from "os"
import { JsonType } from "./JSON"
import { VarInputStream, VarStream } from "./varstream"

export function getAbsolutePath(filePath: string, cwd: string = process.cwd()): string {
    filePath = filePath.split("\\").join("/")
    if (os.platform() == "win32") {
        if (filePath[1] != ":" && filePath[2] != "/") {
            if (!filePath.startsWith("/")) {
                filePath = "/" + filePath
            }
            filePath = process.cwd() + filePath
        }
    } else if (!filePath.startsWith("/")) {
        filePath = process.cwd() + "/" + filePath
    }
    while (filePath.includes("//")) {
        filePath = filePath.split("//").join("/")
    }
    return path.normalize(filePath)
}

export function getFileType(filePath: string): Promise<"FILE" | "DIR" | "NONE"> {
    return new Promise<"FILE" | "DIR" | "NONE">((res, rej) => fs.stat(filePath, (err, state) => {
        if (err) {
            res("NONE")
        } else if (state.isDirectory()) {
            res("DIR")
        } else if (state.isFile()) {
            res("FILE")
        } else {
            res("NONE")
        }
    }))
}

export function getFileTypeSync(filePath: string): "FILE" | "DIR" | "NONE" {
    try {
        const state = fs.statSync(filePath)
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

export function readFile(filePath: string): Promise<string> {
    return new Promise<string>((res, rej) => fs.readFile(filePath, (err, content) => {
        if (err) {
            return rej(err)
        }
        res(content.toString("utf-8"))
    }))
}

export function writeFile(filePath: string, content: string): Promise<void> {
    return new Promise<void>((res, rej) => fs.writeFile(filePath, content, (err) => {
        if (err) {
            return rej(err)
        }
        res()
    }))
}

export function readJson(filePath: string): Promise<JsonType> {
    return new Promise<string>((res, rej) => fs.readFile(filePath, (err, content) => {
        if (err) {
            return rej(err)
        }
        try {
            res(JSON.parse(content.toString("utf-8")))
        } catch (err) {
            rej(err)
        }
    }))
}

export function writeJson(filePath: string, data: JsonType, pretty: boolean = true): Promise<void> {
    return new Promise<void>((res, rej) => fs.writeFile(
        filePath,
        pretty ? JSON.stringify(data, null, 4) : JSON.stringify(data),
        (err) => {
            if (err) {
                return rej(err)
            }
            res()
        }
    ))
}

export function watchChanges(filePath: string): VarInputStream<string> {
    const varstream = new VarStream<string>()
    getFileType(filePath).then((type) => {
        if (varstream.isClosed()) {
            return
        }
        if (type == "NONE") {
            throw new Error("Can't watch something that not exists!")
        }
        const watcher = fs.watch(
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


