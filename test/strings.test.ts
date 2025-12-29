/**
 * Strings node tests
 */

import { describe, it, expect } from '@jest/globals'
import type { Pipe, Strings } from '../src'

describe('String operations', () => {
  it('should get string length', () => {
    type Result = Pipe<"abc", [Strings.Length]>
    const test: Result = 3
    expect(test).toBe(3)
  })

  it('should split string with separator', () => {
    type Result = Pipe<"a,b,c", [Strings.Split<",">]>
    const test: Result = ["a", "b", "c"]
    expect(test).toEqual(["a", "b", "c"])
  })

  it('should split string into characters', () => {
    type Result = Pipe<"abc", [Strings.Split<"">]>
    const test: Result = ["a", "b", "c"]
    expect(test).toEqual(["a", "b", "c"])
  })

  it('should convert string to tuple', () => {
    type Result = Pipe<"abc", [Strings.ToTuple]>
    const test: Result = ["a", "b", "c"]
    expect(test).toEqual(["a", "b", "c"])
  })

  it('should convert number to string', () => {
    type Result = Pipe<123, [Strings.ToString]>
    const test: Result = "123"
    expect(test).toBe("123")
  })

  it('should convert boolean to string', () => {
    type Result = Pipe<true, [Strings.ToString]>
    const test: Result = "true"
    expect(test).toBe("true")
  })

  it('should convert string to number', () => {
    type Result = Pipe<"123", [Strings.ToNumber]>
    const test: Result = 123
    expect(test).toBe(123)
  })

  it('should prepend string', () => {
    type Result = Pipe<"def", [Strings.Prepend<"abc">]>
    const test: Result = "abcdef"
    expect(test).toBe("abcdef")
  })

  it('should append string', () => {
    type Result = Pipe<"abc", [Strings.Append<"def">]>
    const test: Result = "abcdef"
    expect(test).toBe("abcdef")
  })

  it('should uppercase string', () => {
    type Result = Pipe<"abc", [Strings.Uppercase]>
    const test: Result = "ABC"
    expect(test).toBe("ABC")
  })

  it('should lowercase string', () => {
    type Result = Pipe<"ABC", [Strings.Lowercase]>
    const test: Result = "abc"
    expect(test).toBe("abc")
  })

  it('should capitalize string', () => {
    type Result = Pipe<"abc", [Strings.Capitalize]>
    const test: Result = "Abc"
    expect(test).toBe("Abc")
  })

  it('should uncapitalize string', () => {
    type Result = Pipe<"ABC", [Strings.Uncapitalize]>
    const test: Result = "aBC"
    expect(test).toBe("aBC")
  })

  it('should trim whitespace', () => {
    type Result = Pipe<"  abc  ", [Strings.Trim]>
    const test: Result = "abc"
    expect(test).toBe("abc")
  })

  it('should trim custom separator', () => {
    type Result = Pipe<"...abc...", [Strings.Trim<".">]>
    const test: Result = "abc"
    expect(test).toBe("abc")
  })

  it('should trim left whitespace', () => {
    type Result = Pipe<"  abc", [Strings.TrimLeft]>
    const test: Result = "abc"
    expect(test).toBe("abc")
  })

  it('should trim right whitespace', () => {
    type Result = Pipe<"abc  ", [Strings.TrimRight]>
    const test: Result = "abc"
    expect(test).toBe("abc")
  })

  it('should replace all occurrences', () => {
    type Result = Pipe<"a.b.c", [Strings.Replace<".", "/">]>
    const test: Result = "a/b/c"
    expect(test).toBe("a/b/c")
  })

  it('should replace in empty string', () => {
    type Result = Pipe<"", [Strings.Replace<"a", "b">]>
    const test: Result = ""
    expect(test).toBe("")
  })

  it('should repeat string', () => {
    type Result = Pipe<"abc", [Strings.Repeat<3>]>
    const test: Result = "abcabcabc"
    expect(test).toBe("abcabcabc")
  })

  it('should repeat string 0 times', () => {
    type Result = Pipe<"abc", [Strings.Repeat<0>]>
    const test: Result = ""
    expect(test).toBe("")
  })

  it('should check if starts with prefix', () => {
    type T1 = Pipe<"abcdef", [Strings.StartsWith<"abc">]>
    type T2 = Pipe<"abcdef", [Strings.StartsWith<"def">]>
    const test1: T1 = true
    const test2: T2 = false
    expect(test1).toBe(true)
    expect(test2).toBe(false)
  })

  it('should check if ends with suffix', () => {
    type T1 = Pipe<"abcdef", [Strings.EndsWith<"def">]>
    type T2 = Pipe<"abcdef", [Strings.EndsWith<"abc">]>
    const test1: T1 = true
    const test2: T2 = false
    expect(test1).toBe(true)
    expect(test2).toBe(false)
  })

  it('should check if includes substring', () => {
    type T1 = Pipe<"abcdef", [Strings.Includes<"cde">]>
    type T2 = Pipe<"abcdef", [Strings.Includes<"xyz">]>
    const test1: T1 = true
    const test2: T2 = false
    expect(test1).toBe(true)
    expect(test2).toBe(false)
  })

  it('should convert to camelCase from snake_case', () => {
    type Result = Pipe<"hello_world", [Strings.CamelCase]>
    const test: Result = "helloWorld"
    expect(test).toBe("helloWorld")
  })

  it('should convert to camelCase from kebab-case', () => {
    type Result = Pipe<"hello-world", [Strings.CamelCase]>
    const test: Result = "helloWorld"
    expect(test).toBe("helloWorld")
  })

  it('should convert to snake_case', () => {
    type Result = Pipe<"helloWorld", [Strings.SnakeCase]>
    const test: Result = "hello_world"
    expect(test).toBe("hello_world")
  })

  it('should convert to kebab-case', () => {
    type Result = Pipe<"helloWorld", [Strings.KebabCase]>
    const test: Result = "hello-world"
    expect(test).toBe("hello-world")
  })

  it('should handle empty strings', () => {
    type _Length = Pipe<"", [Strings.Length]>
    type Split = Pipe<"", [Strings.Split<",">]>
    type ToTuple = Pipe<"", [Strings.ToTuple]>

    const split: Split = []
    const tuple: ToTuple = []

    expect(split).toEqual([])
    expect(tuple).toEqual([])
  })

  it('should chain multiple operations', () => {
    type Result = Pipe<"  HELLO WORLD  ", [
      Strings.Trim,
      Strings.Lowercase,
      Strings.Replace<" ", "_">
    ]>

    const test: Result = "hello_world"
    expect(test).toBe("hello_world")
  })

  it('should handle single character strings', () => {
    type Length = Pipe<"a", [Strings.Length]>
    type ToTuple = Pipe<"a", [Strings.ToTuple]>
    type Upper = Pipe<"a", [Strings.Uppercase]>

    const length: Length = 1
    const tuple: ToTuple = ["a"]
    const upper: Upper = "A"

    expect(length).toBe(1)
    expect(tuple).toEqual(["a"])
    expect(upper).toBe("A")
  })

  it('should handle complex replacement', () => {
    type Result = Pipe<"foo.bar.baz", [
      Strings.Replace<".", "/">,
      Strings.Prepend<"path/">,
      Strings.Append<".ts">
    ]>

    const test: Result = "path/foo/bar/baz.ts"
    expect(test).toBe("path/foo/bar/baz.ts")
  })
})
