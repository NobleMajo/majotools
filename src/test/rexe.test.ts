import "mocha"
import { Application } from "express"
import * as express from "express"
import { createRexeMiddleware, createRexeObject, RexeInstance } from '../rexe'
import { Server } from "http"
import { expect } from 'chai'
import { Awaitable } from '../../../../statefull/node/src/types'

export const serverRexe = {
    calc: (a: number, b: number) => a + b,
    test: () => "test",
    merge: (a: string, b: string, c: string) => "[" + a + "_" + b + "_" + c + "]",
}

export const clientRexe = {
    calc: (a: number, b: number) => undefined as Awaitable<number>,
    test: () => undefined as Awaitable<string>,
    merge: (a: string, b: string, c: string) => undefined as Awaitable<string>,
}

describe('rexe live', async function () {
    let app: Application
    let server: Server
    let client: typeof clientRexe & RexeInstance

    before('start express test server', async function () {
        app = express()
        app.use(createRexeMiddleware(serverRexe))
        server = await new Promise<Server>(
            (res) => {
                const server = app.listen(
                    54321,
                    "127.0.0.1",
                    () => res(server),
                )
            }
        )
        client = createRexeObject(
            "http://127.0.0.1:54321",
            clientRexe
        )
    })

    after('stop express test server', async function () {
        await new Promise<void>(
            (res) => server.close(() => res())
        )
    })

    it('execute remote "test" function', async function () {
        expect(
            await client.test()
        ).is.equals("test")
    })

    it('execute remote "calc" function', async function () {
        expect(
            await client.calc(3, 7)
        ).is.equals(10)
    })

    it('execute remote "merge" function', async function () {
        expect(
            await client.merge("12", "34", "56")
        ).is.equals("[12_34_56]")
    })
})