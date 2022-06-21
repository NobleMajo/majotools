import "mocha"
import { expect } from 'chai';
import { getStackTraceByError, parseStackTraceElement } from "../stack"
import { uniqueStringify } from "../json"
import { exampleStackTraceElements } from "./examples"

describe('parseStackTraceElement()', async function () {
    it('node', async function () {
        expect(uniqueStringify(
            getStackTraceByError()
                .map((v) => {
                    const index = v.module.indexOf("/majotools/")
                    if (index != -1) {
                        v.module = "?" + v.module.substring(index + 1)
                    }
                    return v
                })
        )).is.equals(uniqueStringify([
            {
                "method": "Context.<anonymous>",
                "module": "?majotools/src/test/elements.test.ts",
                "suffix": "",
                "line": 10,
                "char": 33
            },
            {
                "method": "step",
                "module": "?majotools/src/test/elements.test.ts",
                "suffix": "",
                "line": 33,
                "char": 23
            },
            {
                "method": "Object.next",
                "module": "?majotools/src/test/elements.test.ts",
                "suffix": "",
                "line": 14,
                "char": 53
            },
            {
                "method": "none",
                "module": "?majotools/src/test/elements.test.ts",
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
                "module": "?majotools/src/test/elements.test.ts",
                "suffix": "",
                "line": 4,
                "char": 12
            },
            {
                "method": "Context.<anonymous>",
                "module": "?majotools/src/test/elements.test.ts",
                "suffix": "",
                "line": 47,
                "char": 24
            },
            {
                "method": "callFn",
                "module": "?majotools/node_modules/mocha/lib/runnable.js",
                "suffix": "",
                "line": 366,
                "char": 21
            },
            {
                "method": "Test.Runnable.run",
                "module": "?majotools/node_modules/mocha/lib/runnable.js",
                "suffix": "",
                "line": 354,
                "char": 5
            },
            {
                "method": "Runner.runTest",
                "module": "?majotools/node_modules/mocha/lib/runner.js",
                "suffix": "",
                "line": 678,
                "char": 10
            },
            {
                "method": "none",
                "module": "?majotools/node_modules/mocha/lib/runner.js",
                "suffix": " ",
                "line": 801,
                "char": 12
            },
            {
                "method": "next",
                "module": "?majotools/node_modules/mocha/lib/runner.js",
                "suffix": "",
                "line": 593,
                "char": 14
            },
            {
                "method": "none",
                "module": "?majotools/node_modules/mocha/lib/runner.js",
                "suffix": " ",
                "line": 603,
                "char": 7
            },
            {
                "method": "next",
                "module": "?majotools/node_modules/mocha/lib/runner.js",
                "suffix": "",
                "line": 486,
                "char": 14
            },
            {
                "method": "Immediate._onImmediate",
                "module": "?majotools/node_modules/mocha/lib/runner.js",
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