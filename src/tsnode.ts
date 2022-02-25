import { NodeOptions } from './node';
import { VarDuplex, LogType } from './varstream';
const bin = (process.env["_"] ?? "").toLowerCase()
export const isTsNode: boolean = bin.includes("tsnode") || bin.includes("ts-node")
import node from "./node"

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
    timeoutMillis: 1000 * 60 * 5,
    tsNodePath: "node_modules/ts-node/dist/bin.js"
}

export function tsnode(
    script: string,
    args: string[],
    options?: TsNodeOptions
): VarDuplex<LogType<Buffer>, Buffer> {
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

export default tsnode