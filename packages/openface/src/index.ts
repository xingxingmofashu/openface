import yargs from 'yargs'
import { hideBin } from "yargs/helpers"
import { TranslationCommand } from "./cli/cmd/translation"
import { PullCommand } from './cli/cmd/pull'

const cli = yargs(hideBin(process.argv))
  .parserConfiguration({ "populate--": true })
  .scriptName("openface")
  .wrap(100)
  .help("help", "show help")
  .alias("help", "h")
  .command(TranslationCommand)
  .command(PullCommand)
  .fail((msg, err) => {
    if (
      msg?.startsWith("Unknown argument") ||
      msg?.startsWith("Not enough non-option arguments") ||
      msg?.startsWith("Invalid values:")
    ) {
      if (err) throw err
      cli.showHelp("log")
    }
    if (err) throw err
    process.exit(1)
  })
  .strict()

try {
  await cli.parse()
} catch (error) {
  process.exitCode = 1
} finally {
  // Some subprocesses don't react properly to SIGTERM and similar signals.
  // Most notably, some docker-container-based MCP servers don't handle such signals unless
  // run using `docker run --init`.
  // Explicitly exit to avoid any hanging subprocesses.
  process.exit()
}
