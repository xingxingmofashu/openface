import { createInterface, type ReadLineOptions } from 'node:readline/promises'
import consola from 'consola'
import clipboardy from 'clipboardy'

export interface CreateReplOptions extends ReadLineOptions {
  stream?: boolean
}

export async function createRepl(options: CreateReplOptions, callback?: (input: string) => Promise<string | undefined>) {
  const repl = createInterface(options)
  repl.write(`Type \x1b[36m.copy [code]\x1b[0m to copy to clipboard. \x1b[36m.help\x1b[0m for more info.\n`)
  while (true) {
    const input = await repl.question("> ")
    if (input === ".exit") {
      break
    }

    if (input === ".help") {
      const helpinfo = [{
        titile: `\n\x1b[1mREPL Commands:\x1b[0m\n`,
        content: [
          `  \x1b[36m.exit        \x1b[0m - Exit the REPL\n`,
          `  \x1b[36m.copy        \x1b[0m - Copy result to clipboard (.copy [expr])\n`,
          `  \x1b[36m.help        \x1b[0m - Print this help message\n`
        ]
      }]
      helpinfo.forEach(x => {
        repl.write(x.titile)
        x.content.forEach(c => {
          repl.write(c)
        })
      })
      continue
    }

    const output = await callback?.(input.replace('.copy ', ''))
    if (!options.stream && output) {
      repl.write(`${output}\n`)
    }

    if (input.startsWith(".copy ")) {
      try {
        if (output) {
          await clipboardy.write(output)
          repl.write(`\x1b[90mCopied ${output.length} characters to clipboard\x1b[0m\n`)
        }
      } catch (error) {
        consola.error(`Failed to copy:${error}\n`)
      }
      continue
    }
  }

  return repl
}