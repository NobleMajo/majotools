import "mocha"
import { expect } from 'chai';
import { isClass, isClassInstance, isAnonymInstance } from '../types';

export class FirstClass {
    test: string = "test"
    count: number = -1
    print(): string {
        return this.test
    }
}

export class SecondClass extends FirstClass {
    test: string = "nono"
    count: number = 1000
    print(): string {
        return this.test
    }
}

export interface TestClass {
    name: string,
    isTestCkass(): boolean,
}

export interface TestConstructor {
    new(id: number): TestClass,
}

export const Test = function (this: TestClass, id: number) {
    this.name = "Id:" + id
} as any as TestConstructor

Test.prototype.isTestClass = function () {
    return true
}

describe('majotools types', async function () {
    it('isClass', async function () {
        expect(JSON.stringify({
            number: isClass(123),
            string: isClass("some string"),
            function: isClass(isClass),
            anonymFunction: isClass(() => { }),
            emptyArray: isClass([]),
            array: isClass(["test", "123", "hallo"]),
            emptyAnonymObject: isClass({}),
            anonymObject: isClass({
                test: "test",
                hallo: "world",
                foo: "bar",
            }),
            class: isClass(FirstClass),
            extendedClass: isClass(SecondClass),
            globalArrayClass: isClass(Array),
            globalNumberClass: isClass(Number),
            functionClass: isClass(Test),
            classInstance: isClass(new FirstClass()),
            extendedClassInstance: isClass(new SecondClass()),
        }, null, 4)).is.equals(JSON.stringify({
            number: false,
            string: false,
            function: false,
            anonymFunction: false,
            emptyArray: false,
            array: false,
            emptyAnonymObject: false,
            anonymObject: false,
            class: true,
            extendedClass: true,
            globalArrayClass: true,
            globalNumberClass: true,
            functionClass: true,
            classInstance: false,
            extendedClassInstance: false,
        }, null, 4))
    })

    it('isClassInstance', async function () {
        expect(JSON.stringify({
            number: isClassInstance(123),
            string: isClassInstance("some string"),
            function: isClassInstance(isClass),
            anonymFunction: isClassInstance(() => { }),
            emptyArray: isClassInstance([]),
            array: isClassInstance(["test", "123", "hallo"]),
            emptyAnonymObject: isClassInstance({}),
            anonymObject: isClassInstance({
                test: "test",
                hallo: "world",
                foo: "bar",
            }),
            class: isClassInstance(FirstClass),
            extendedClass: isClassInstance(SecondClass),
            functionClass: isClassInstance(Test),
            classInstance: isClassInstance(new FirstClass()),
            extendedClassInstance: isClassInstance(new SecondClass())
        }, null, 4)).is.equals(JSON.stringify({
            number: false,
            string: false,
            function: false,
            anonymFunction: false,
            emptyArray: true,
            array: true,
            emptyAnonymObject: false,
            anonymObject: false,
            class: false,
            extendedClass: false,
            functionClass: false,
            classInstance: true,
            extendedClassInstance: true,
        }, null, 4))
    })

    it('isAnonymInstance', async function () {
        expect(JSON.stringify({
            number: isAnonymInstance(123),
            string: isAnonymInstance("some string"),
            function: isAnonymInstance(isClass),
            anonymFunction: isAnonymInstance(() => { }),
            emptyArray: isAnonymInstance([]),
            array: isAnonymInstance(["test", "123", "hallo"]),
            emptyAnonymObject: isAnonymInstance({}),
            anonymObject: isAnonymInstance({
                test: "test",
                hallo: "world",
                foo: "bar",
            }),
            class: isAnonymInstance(FirstClass),
            extendedClass: isAnonymInstance(SecondClass),
            functionClass: isAnonymInstance(Test),
            classInstance: isAnonymInstance(new FirstClass()),
            extendedClassInstance: isAnonymInstance(new SecondClass())
        }, null, 4)).is.equals(JSON.stringify({
            number: false,
            string: false,
            function: false,
            anonymFunction: false,
            emptyArray: false,
            array: false,
            emptyAnonymObject: true,
            anonymObject: true,
            class: false,
            extendedClass: false,
            functionClass: false,
            classInstance: false,
            extendedClassInstance: false,
        }, null, 4))
    })
})