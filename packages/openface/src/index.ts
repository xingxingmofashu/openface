import yargs from 'yargs'
import { hideBin } from "yargs/helpers"
import { PullCommand } from './cli/commands/pull'
import { ConfigCommand } from './cli/commands/config'
import { RunCommand } from './cli/commands/run'
import { ListCommand } from './cli/commands/list'
import { RemoveCommand } from './cli/commands/remove'

const cli = yargs(hideBin(process.argv))
  .parserConfiguration({ "populate--": true })
  .scriptName("openface")
  .wrap(yargs().terminalWidth())
  .help("help", "show help")
  .alias("help", "h")
  .command(PullCommand)
  .command(ConfigCommand)
  .command(ListCommand)
  .command(RemoveCommand)
  .command(RunCommand)
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
  if (error instanceof Error) {
    console.error(error.message)
  }
  process.exitCode = 1
} finally {
  // Some subprocesses don't react properly to SIGTERM and similar signals.
  // Most notably, some docker-container-based MCP servers don't handle such signals unless
  // run using `docker run --init`.
  // Explicitly exit to avoid any hanging subprocesses.
  process.exit()
}
