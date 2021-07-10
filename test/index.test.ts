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