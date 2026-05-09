import { prepareTransformersRuntime } from "../../../config";
import { type ReplHandler } from "..";

export const createTranslationHandler = async (
  modelId: string,
  stream: boolean,
): Promise<ReplHandler> => {
  await prepareTransformersRuntime();
  const { useTranslation } = await import("../../../tasks/translation");
  const { translator } = await useTranslation(modelId);
  return async (input: string) => {
    const output = await translator(input, {
      stream,
    });
    return output.at(-1)?.translation_text;
  };
};
