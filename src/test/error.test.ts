import "mocha"
import { expect } from 'chai';
import { WrappingError } from '../error';

describe('WrappedError', async function () {
    it('simple', async function () {
        const originError = new Error()
        const wrappedError = new WrappingError(originError, "New message")
        expect(wrappedError.stack.startsWith("New message:\n")).is.true
        expect(wrappedError.stack).is.include("at WrappedError (majotools/dist/error)")
    })

    it('class', async function () {
        const originError = new Error()
        class OwnError extends WrappingError {
            constructor(err: Error, msg: string, msg2: string) {
                super(err, msg + "!\n" + msg2)
            }
        }
        const wrappedError = new OwnError(originError, "First message", "Second message")
        expect(wrappedError.stack.startsWith("First message!\nSecond message:\n")).is.true
        expect(wrappedError.stack).is.include("at WrappedError (majotools/dist/error)")
    })
})