import "mocha"
import { expect } from 'chai';
import { parseStackTraceElement } from "../stack"
import { uniqueStringify } from "../json"
import { exampleStackTraceElements } from "./examples"

describe('parseStackTraceElement()', async function () {
    it('node', async function () {
        expect(uniqueStringify(
            parseStackTraceElement(
                exampleStackTraceElements.nodeStack
            )
        )).is.equals(uniqueStringify({
            "source": "Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:77:12)",
            "method": "Function.executeUserEntryPoint",
            "as": "s runMain",
            "module": "node",
            "suffix": "",
            "line": 0,
        }))
    })

    it('ts-node', async function () {
        expect(uniqueStringify(
            parseStackTraceElement(
                exampleStackTraceElements.tsNodeStack
            )
        )).is.equals(uniqueStringify({
            "source": "reportTSError (/home/codec/ws/main/npm/majotools/node_modules/ts-node/src/index.ts:847:19)",
            "method": "reportTSError",
            "module": "/home/codec/ws/main/npm/majotools/node_modules/ts-node/src/index.ts",
            "suffix": "",
            "line": 847,
            "char": 19,
        }))
    })

    it('new Promise', async function () {
        expect(uniqueStringify(
            parseStackTraceElement(
                exampleStackTraceElements.newPromiseStack
            )
        )).is.equals(uniqueStringify({
            "source": "new Promise (<anonymous>)",
            "method": "new Promise",
            "module": "<anonymous>",
            "suffix": "",
        }))
    })

    it('__awaiter', async function () {
        expect(uniqueStringify(
            parseStackTraceElement(
                exampleStackTraceElements.awaiterStack
            )
        )).is.equals(uniqueStringify({
            "source": "__awaiter (src/test/stack.test.ts:4:12)",
            "method": "__awaiter",
            "module": "src/test/stack.test.ts",
            "suffix": "",
            "line": 4,
            "char": 12,
        }))
    })

    it('none stack', async function () {
        expect(() => parseStackTraceElement(
            exampleStackTraceElements.noneStack
        )).throws(
            "String is not a stack trace element because '(' and ')' is missing!"
        )
    })

    it('test command', async function () {
        expect(() => parseStackTraceElement(
            exampleStackTraceElements.testCommand
        )).throws(
            "String is not a stack trace element because '(' and ')' is missing!"
        )
    })
})