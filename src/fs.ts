import { promises as fs, statSync, watch } from "fs"
import * as path from "path"
import * as os from "os"
import { VarInputStream, VarStream } from "./varstream"
import { JsonTypes } from "./json"

export function getAbsolutePath(
    filePath: string,
    cwd: string = process.cwd()
): string {
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


