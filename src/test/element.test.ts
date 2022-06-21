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
            "String is not a stack trace element because '(' and ')' is missing in:\n" +
            "'12     PKr123oEVkx xX123w Ei3232BhjbY  123    0O 3211'"
        )
    })

    it('test command', async function () {
        expect(() => parseStackTraceElement(
            exampleStackTraceElements.testCommand
        )).throws(
            "String is not a stack trace element because '(' and ')' is missing in:\n" +
            "'mocha --require ts-node/register src/test/**/*.test.ts'"
        )
    })
})