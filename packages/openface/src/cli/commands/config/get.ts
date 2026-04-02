import { useConfig } from "../../../config";
import { UI } from "../../utils/ui";
import { cmd } from "../../utils/cmd";
import { log, intro, outro } from '@clack/prompts'

export const ConfigGetCommand = cmd({
  command: 'get',
  describe: "get config",
  builder: (yargs) =>
    yargs
      .option("name", {
        type: 'string',
        alias: ['n'],
        default: ''
      }),
  async handler(args) {
    const { GLOBAL_CONFIG_PATH, config } = await useConfig()
    intro(`Configurations ${UI.Style.TEXT_DIM}${GLOBAL_CONFIG_PATH}`)

    function flatten(obj: any, prefix = '') {
      let result: [string, string][] = [];
      for (let key in obj) {
        const newKey = prefix ? `${prefix}_${key}` : key;
        const val = obj[key];
        if (typeof val === 'object' && val !== null) {
          result = result.concat(flatten(val, newKey));
        } else {
          result.push([newKey, val]);
        }
      }
      return result;
    }
    const result = flatten(config).filter(([key, value]) => key.toUpperCase().includes(args.name.toUpperCase()))
    for (const [key, value] of result) {
      log.info(`${key.toUpperCase()} ${UI.Style.TEXT_DIM}${value}`)
    }

    outro("Set config with: openface config set")
  }
})