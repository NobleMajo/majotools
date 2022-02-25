import * as fs from "./fs"
import * as git from "./git"
import * as json from "./json"
import * as net from "./net"
import * as node from "./node"
import * as prompt from "./prompt"
import * as shell from "./shell"
import * as systemImport from "./systemImport"
import * as string from "./string"
import * as tsc from "./tsc"
import * as tsnode from "./tsnode"
import * as varstream from "./varstream"

export default {
    fs: fs,
    git: git,
    json: json,
    net: net,
    string: string,
    varstream: varstream,
    prompt: prompt,
    systemImport: systemImport,
    shell: shell,
    node: node,
    tsc: tsc,
    tsnode: tsnode,
}