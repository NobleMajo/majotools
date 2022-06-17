function buildStackTrace(): string {
  function bst(f) {
    return !f ?
      [] :
      bst(f.caller)
        .concat(
          [
            f.toString()
              .split('(')[0]
              .substring(9) +
            '(' + f.arguments.join(',') + ')'
          ]
        )
  }
  return bst(
    arguments.callee.caller
  )
}

export function getStackTrace(): string {
  let stack: string
  try {
    stack = buildStackTrace()
  } catch (err) {
    const err2 = new Error()
    stack = err2.stack ??
      (err2 as any).stacktrace
    if (typeof stack != "string") {
      throw err
    }
  }
  return stack
}

export interface StackTraceElement {
  source: string,
  method?: string,
  module?: string,
  line?: number,
  char?: number,
  as?: string,
  suffix?: string,
}

export const numbers: string[] = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
]

export function parseStackTraceElement(
  src: string,
): StackTraceElement {
  if (src.includes("\n")) {
    src = src.split("\n").join(" ")
  }
  while (src.startsWith(" ")) {
    src = src.substring(1)
  }
  while (src.endsWith(" ")) {
    src = src.slice(0, -1)
  }
  if (src.startsWith("at ")) {
    src = src.substring(3)
    while (src.startsWith(" ")) {
      src = src.substring(1)
    }
  }
  if (src.length == 0) {
    throw new Error(
      "No stack data in stack trace source string: '" +
      src +
      "'"
    )
  }
  const ret: StackTraceElement = {
    source: src,
  }
  let index: number = src.indexOf("[")
  let index2: number = src.indexOf("]", index + 1)
  if (
    index != -1 &&
    index2 != -1
  ) {
    ret.method = src.substring(0, index)
    while (ret.method.endsWith(" ")) {
      ret.method = ret.method.slice(0, -1)
    }
    ret.as = src.substring(index + 1, index2)
    src = src.substring(index2 + 1)
    while (ret.as.startsWith(" ")) {
      ret.as = ret.as.substring(1)
    }
    if (ret.as.startsWith("as")) {
      ret.as = ret.as.substring(1)
    }
    while (ret.as.startsWith(" ")) {
      ret.as = ret.as.substring(1)
    }
    while (ret.as.endsWith(" ")) {
      ret.as = ret.as.slice(0, -1)
    }
  }

  index = src.indexOf("(")
  index2 = src.indexOf(")", index + 1)
  if (
    index != -1 &&
    index2 != -1
  ) {
    if(!ret.method){
      ret.method = src.substring(0, index)
      while (ret.method.endsWith(" ")) {
        ret.method = ret.method.slice(0, -1)
      }
    }

    ret.module = src.substring(index + 1, index2)
    while (ret.module.endsWith(" ")) {
      ret.module = ret.module.slice(0, -1)
    }
    while (ret.module.startsWith(" ")) {
      ret.module = ret.module.substring(1)
    }
    ret.suffix = src.substring(index2 + 1)

    index = ret.module.indexOf(":")
    index2 = ret.module.indexOf(":", index + 1)

    let line: string
    let char: string
    if (index != -1) {
      if (index2 != -1) {
        line = ret.module.substring(index + 1, index2)
        char = ret.module.substring(index2 + 1)
      } else {
        line = ret.module.substring(index + 1)
      }
      ret.module = ret.module.substring(0, index)
    }
    if (line) {
      while (
        line.length != 0 &&
        !numbers.includes(line[0])
      ) {
        line = line.substring(1)
      }
      while (
        line.length != 0 &&
        !numbers.includes(line[line.length - 1])
      ) {
        line = line.slice(0, -1)
      }
      const line2: number = Number(line)
      if (!isNaN(line2)) {
        ret.line = line2
      }
      if (char) {
        while (
          char &&
          char.length != 0 &&
          !numbers.includes(char[0])
        ) {
          char = char.substring(1)
        }
        while (
          char &&
          char.length != 0 &&
          !numbers.includes(char[char.length - 1])
        ) {
          char = char.slice(0, -1)
        }
        const char2: number = Number(char)
        if (!isNaN(char2)) {
          ret.char = char2
        }
      }
    }
  } else {
    throw new Error("String is not a stack trace element because '(' and ')' is missing!")
  }
  return ret
}
