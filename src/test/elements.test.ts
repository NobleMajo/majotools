import "mocha"
import { expect } from 'chai';
import { getStackTraceByError, parseStackTraceElement } from "../stack"
import { uniqueStringify } from "../json"
import { exampleStackTraceElements } from "./examples"

describe('parseStackTraceElement()', async function () {
    it('node', async function () {
        expect(uniqueStringify(
            getStackTraceByError()
        )).is.equals(uniqueStringify([
            {
                "method": "Context.<anonymous>",
                "module": "/home/codec/ws/main/npm/majotools/src/test/elements.test.ts",
                "suffix": "",
                "line": 10,
                "char": 33
            },
            {
                "method": "step",
                "module": "/home/codec/ws/main/npm/majotools/src/test/elements.test.ts",
                "suffix": "",
                "line": 33,
                "char": 23
            },
            {
                "method": "Object.next",
                "module": "/home/codec/ws/main/npm/majotools/src/test/elements.test.ts",
                "suffix": "",
                "line": 14,
                "char": 53
            },
            {
                "method": "none",
                "module": "/home/codec/ws/main/npm/majotools/src/test/elements.test.ts",
                "suffix": " ",
                "line": 8,
                "char": 71
            },
            {
                "method": "new Promise",
                "module": "<anonymous>",
                "suffix": ""
            },
            {
                "method": "__awaiter",
                "module": "/home/codec/ws/main/npm/majotools/src/test/elements.test.ts",
                "suffix": "",
                "line": 4,
                "char": 12
            },
            {
                "method": "Context.<anonymous>",
                "module": "/home/codec/ws/main/npm/majotools/src/test/elements.test.ts",
                "suffix": "",
                "line": 47,
                "char": 24
            },
            {
                "method": "callFn",
                "module": "/home/codec/ws/main/npm/majotools/node_modules/mocha/lib/runnable.js",
                "suffix": "",
                "line": 366,
                "char": 21
            },
            {
                "method": "Test.Runnable.run",
                "module": "/home/codec/ws/main/npm/majotools/node_modules/mocha/lib/runnable.js",
                "suffix": "",
                "line": 354,
                "char": 5
            },
            {
                "method": "Runner.runTest",
                "module": "/home/codec/ws/main/npm/majotools/node_modules/mocha/lib/runner.js",
                "suffix": "",
                "line": 678,
                "char": 10
            },
            {
                "method": "none",
                "module": "/home/codec/ws/main/npm/majotools/node_modules/mocha/lib/runner.js",
                "suffix": " ",
                "line": 801,
                "char": 12
            },
            {
                "method": "next",
                "module": "/home/codec/ws/main/npm/majotools/node_modules/mocha/lib/runner.js",
                "suffix": "",
                "line": 593,
                "char": 14
            },
            {
                "method": "none",
                "module": "/home/codec/ws/main/npm/majotools/node_modules/mocha/lib/runner.js",
                "suffix": " ",
                "line": 603,
                "char": 7
            },
            {
                "method": "next",
                "module": "/home/codec/ws/main/npm/majotools/node_modules/mocha/lib/runner.js",
                "suffix": "",
                "line": 486,
                "char": 14
            },
            {
                "method": "Immediate._onImmediate",
                "module": "/home/codec/ws/main/npm/majotools/node_modules/mocha/lib/runner.js",
                "suffix": "",
                "line": 571,
                "char": 5
            },
            {
                "method": "processImmediate",
                "module": "node",
                "suffix": "",
                "line": 0
            }
        ]))
    })
})