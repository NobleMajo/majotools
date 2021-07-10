import "mocha"
import { expect } from 'chai';

import * as index from "../src/index"

describe('index.replaceAll', () => {
    it('check replaceAll with small word', () => {
        const word: string = "test"
        const search: string[] = ["st"]
        const replacement: string = "xt"
        const result = index.replaceAll(word, search, replacement)
        expect(result).is.equals("text")
    })

    it('check replaceAll with large word', () => {
        const word: string = "SomeLargeWord"
        const search: string[] = ["Large", "Word"]
        const replacement: string = "Small"
        const result = index.replaceAll(word, search, replacement)
        expect(result).is.equals("SomeSmallSmall")
    })

    it('check replaceAll with text', () => {
        const word: string = "This is a small but nice test text :3 just for u!"
        const search: string[] = ["i", "u", "T", "t"]
        const replacement: string = "?"
        const result = index.replaceAll(word, search, replacement)
        expect(result).is.equals("?h?s ?s a small b?? n?ce ?es? ?ex? :3 j?s? for ?!")
    })

    it('check replaceAll to remove some none numeric chars', () => {
        const word: string = "0T123his is a small bu45t nice t6est 7text :8 just for u!9"
        const search: string[] = "ABCDEFGHIJKLNMOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz,.-;:_ !§$%&/()=?".split("")
        const replacement: string = ""
        const result = index.replaceAll(word, search, replacement)
        expect(result).is.equals("0123456789")
        expect(Number(result)).is.equals(123456789)
    })
})

describe('index.is*CharCode', () => {
    it('check isAlphaNumericCharCode', () => {
        expect(index.isAlphaNumericCharCode("a".charCodeAt(0))).to.be.true
        expect(index.isAlphaNumericCharCode("r".charCodeAt(0))).to.be.true
        expect(index.isAlphaNumericCharCode("z".charCodeAt(0))).to.be.true
        expect(index.isAlphaNumericCharCode("3".charCodeAt(0))).to.be.true
        expect(index.isAlphaNumericCharCode("9".charCodeAt(0))).to.be.true
        expect(index.isAlphaNumericCharCode("0r".charCodeAt(0))).to.be.true
        expect(index.isAlphaNumericCharCode("T".charCodeAt(0))).to.be.true
        expect(index.isAlphaNumericCharCode("C".charCodeAt(0))).to.be.true
        expect(index.isAlphaNumericCharCode("X".charCodeAt(0))).to.be.true

        expect(index.isAlphaNumericCharCode("!".charCodeAt(0))).to.be.false
        expect(index.isAlphaNumericCharCode(".".charCodeAt(0))).to.be.false
        expect(index.isAlphaNumericCharCode("ß".charCodeAt(0))).to.be.false
        expect(index.isAlphaNumericCharCode("Ö".charCodeAt(0))).to.be.false
    })

    it('check isUppercaseAlphabeticCharCode', () => {
        expect(index.isUppercaseAlphabeticCharCode("B".charCodeAt(0))).to.be.true
        expect(index.isUppercaseAlphabeticCharCode("G".charCodeAt(0))).to.be.true
        expect(index.isUppercaseAlphabeticCharCode("U".charCodeAt(0))).to.be.true

        expect(index.isUppercaseAlphabeticCharCode("f".charCodeAt(0))).to.be.false
        expect(index.isUppercaseAlphabeticCharCode("!".charCodeAt(0))).to.be.false
        expect(index.isUppercaseAlphabeticCharCode("Ö".charCodeAt(0))).to.be.false
        expect(index.isUppercaseAlphabeticCharCode(";".charCodeAt(0))).to.be.false
        expect(index.isUppercaseAlphabeticCharCode("5".charCodeAt(0))).to.be.false
    })

    it('check isLowercaseAlphabeticCharCode', () => {
        expect(index.isLowercaseAlphabeticCharCode("a".charCodeAt(0))).to.be.true
        expect(index.isLowercaseAlphabeticCharCode("h".charCodeAt(0))).to.be.true
        expect(index.isLowercaseAlphabeticCharCode("y".charCodeAt(0))).to.be.true

        expect(index.isLowercaseAlphabeticCharCode("R".charCodeAt(0))).to.be.false
        expect(index.isLowercaseAlphabeticCharCode("!".charCodeAt(0))).to.be.false
        expect(index.isLowercaseAlphabeticCharCode("ä".charCodeAt(0))).to.be.false
        expect(index.isLowercaseAlphabeticCharCode(";".charCodeAt(0))).to.be.false
        expect(index.isLowercaseAlphabeticCharCode("5".charCodeAt(0))).to.be.false
    })

    it('check isNumericCharCode', () => {
        expect(index.isNumericCharCode("0".charCodeAt(0))).to.be.true
        expect(index.isNumericCharCode("1".charCodeAt(0))).to.be.true
        expect(index.isNumericCharCode("9".charCodeAt(0))).to.be.true

        expect(index.isNumericCharCode("R".charCodeAt(0))).to.be.false
        expect(index.isNumericCharCode("!".charCodeAt(0))).to.be.false
        expect(index.isNumericCharCode("ä".charCodeAt(0))).to.be.false
        expect(index.isNumericCharCode(";".charCodeAt(0))).to.be.false
        expect(index.isNumericCharCode("j".charCodeAt(0))).to.be.false
    })
})

describe('index.simplify', () => {
    it('check simplify', () => {
        expect(index.simplify("012/345.67!89")).is.equals("012-345-67-89")
        expect(index.simplify("7ztd3_4zwl-94t8 z3l_4z cw-l8tzlrt")).is.equals("7ztd3-4zwl-94t8-z3l-4z-cw-l8tzlrt")
        expect(index.simplify("a")).is.equals("a")
        expect(index.simplify("HelloMyNameIs Majo")).is.equals("hellomynameis-majo")
        expect(index.simplify("What's up?")).is.equals("what-s-up")
        expect(index.simplify("mocha -r ts-node/register 'test/**/*.test.ts'")).is.equals("mocha-r-ts-node-register-test-test-ts")
        expect(index.simplify("root@73cd0de4d28a:~/src# cd majotools/")).is.equals("root-73cd0de4d28a-src-cd-majotools")
        expect(index.simplify("-rw-r--r-- 1 root codec    0 Jul 10 16:18 README.md")).is.equals("rw-r-r-1-root-codec-0-jul-10-16-18-readme-md")
    })
})