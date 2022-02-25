import "mocha"
import { expect } from 'chai';

import index from "../index"

describe('index.string.replaceAll', () => {
    it('check replaceAll with small word', () => {
        const word: string = "test"
        const search: string[] = ["st"]
        const replacement: string = "xt"
        const result = index.string.replaceAll(word, search, replacement)
        expect(result).is.equals("text")
    })

    it('check replaceAll with large word', () => {
        const word: string = "SomeLargeWord"
        const search: string[] = ["Large", "Word"]
        const replacement: string = "Small"
        const result = index.string.replaceAll(word, search, replacement)
        expect(result).is.equals("SomeSmallSmall")
    })

    it('check replaceAll with text', () => {
        const word: string = "This is a small but nice test text :3 just for u!"
        const search: string[] = ["i", "u", "T", "t"]
        const replacement: string = "?"
        const result = index.string.replaceAll(word, search, replacement)
        expect(result).is.equals("?h?s ?s a small b?? n?ce ?es? ?ex? :3 j?s? for ?!")
    })

    it('check replaceAll to remove some none numeric chars', () => {
        const word: string = "0T123his is a small bu45t nice t6est 7text :8 just for u!9"
        const search: string[] = "ABCDEFGHIJKLNMOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz,.-;:_ !§$%&/()=?".split("")
        const replacement: string = ""
        const result = index.string.replaceAll(word, search, replacement)
        expect(result).is.equals("0123456789")
        expect(Number(result)).is.equals(123456789)
    })
})

describe('index.string.is*CharCode', () => {
    it('check isAlphaNumericCharCode', () => {
        expect(index.string.isAlphaNumericCharCode("a".charCodeAt(0))).to.be.true
        expect(index.string.isAlphaNumericCharCode("r".charCodeAt(0))).to.be.true
        expect(index.string.isAlphaNumericCharCode("z".charCodeAt(0))).to.be.true
        expect(index.string.isAlphaNumericCharCode("3".charCodeAt(0))).to.be.true
        expect(index.string.isAlphaNumericCharCode("9".charCodeAt(0))).to.be.true
        expect(index.string.isAlphaNumericCharCode("0r".charCodeAt(0))).to.be.true
        expect(index.string.isAlphaNumericCharCode("T".charCodeAt(0))).to.be.true
        expect(index.string.isAlphaNumericCharCode("C".charCodeAt(0))).to.be.true
        expect(index.string.isAlphaNumericCharCode("X".charCodeAt(0))).to.be.true

        expect(index.string.isAlphaNumericCharCode("!".charCodeAt(0))).to.be.false
        expect(index.string.isAlphaNumericCharCode(".".charCodeAt(0))).to.be.false
        expect(index.string.isAlphaNumericCharCode("ß".charCodeAt(0))).to.be.false
        expect(index.string.isAlphaNumericCharCode("Ö".charCodeAt(0))).to.be.false
    })

    it('check isUppercaseAlphabeticCharCode', () => {
        expect(index.string.isUppercaseAlphabeticCharCode("B".charCodeAt(0))).to.be.true
        expect(index.string.isUppercaseAlphabeticCharCode("G".charCodeAt(0))).to.be.true
        expect(index.string.isUppercaseAlphabeticCharCode("U".charCodeAt(0))).to.be.true

        expect(index.string.isUppercaseAlphabeticCharCode("f".charCodeAt(0))).to.be.false
        expect(index.string.isUppercaseAlphabeticCharCode("!".charCodeAt(0))).to.be.false
        expect(index.string.isUppercaseAlphabeticCharCode("Ö".charCodeAt(0))).to.be.false
        expect(index.string.isUppercaseAlphabeticCharCode(";".charCodeAt(0))).to.be.false
        expect(index.string.isUppercaseAlphabeticCharCode("5".charCodeAt(0))).to.be.false
    })

    it('check isLowercaseAlphabeticCharCode', () => {
        expect(index.string.isLowercaseAlphabeticCharCode("a".charCodeAt(0))).to.be.true
        expect(index.string.isLowercaseAlphabeticCharCode("h".charCodeAt(0))).to.be.true
        expect(index.string.isLowercaseAlphabeticCharCode("y".charCodeAt(0))).to.be.true

        expect(index.string.isLowercaseAlphabeticCharCode("R".charCodeAt(0))).to.be.false
        expect(index.string.isLowercaseAlphabeticCharCode("!".charCodeAt(0))).to.be.false
        expect(index.string.isLowercaseAlphabeticCharCode("ä".charCodeAt(0))).to.be.false
        expect(index.string.isLowercaseAlphabeticCharCode(";".charCodeAt(0))).to.be.false
        expect(index.string.isLowercaseAlphabeticCharCode("5".charCodeAt(0))).to.be.false
    })

    it('check isNumericCharCode', () => {
        expect(index.string.isNumericCharCode("0".charCodeAt(0))).to.be.true
        expect(index.string.isNumericCharCode("1".charCodeAt(0))).to.be.true
        expect(index.string.isNumericCharCode("9".charCodeAt(0))).to.be.true

        expect(index.string.isNumericCharCode("R".charCodeAt(0))).to.be.false
        expect(index.string.isNumericCharCode("!".charCodeAt(0))).to.be.false
        expect(index.string.isNumericCharCode("ä".charCodeAt(0))).to.be.false
        expect(index.string.isNumericCharCode(";".charCodeAt(0))).to.be.false
        expect(index.string.isNumericCharCode("j".charCodeAt(0))).to.be.false
    })
})

describe('index.string.simplify', () => {
    it('check simplify', () => {
        expect(index.string.simplify("012/345.67!89")).is.equals("012-345-67-89")
        expect(index.string.simplify("7ztd3_4zwl-94t8 z3l_4z cw-l8tzlrt")).is.equals("7ztd3-4zwl-94t8-z3l-4z-cw-l8tzlrt")
        expect(index.string.simplify("a")).is.equals("a")
        expect(index.string.simplify("HelloMyNameIs Majo")).is.equals("hellomynameis-majo")
        expect(index.string.simplify("What's up?")).is.equals("what-s-up")
        expect(index.string.simplify("mocha -r ts-node/register 'test/**/*.test.ts'")).is.equals("mocha-r-ts-node-register-test-test-ts")
        expect(index.string.simplify("root@73cd0de4d28a:~/src# cd majotools/")).is.equals("root-73cd0de4d28a-src-cd-majotools")
        expect(index.string.simplify("-rw-r--r-- 1 root codec    0 Jul 10 16:18 README.md")).is.equals("rw-r-r-1-root-codec-0-jul-10-16-18-readme-md")
    })
})