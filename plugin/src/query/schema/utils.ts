import { z } from "zod/v4";

export const aliasedSchema = <TKeys extends z.ZodUnion>(
  _: TKeys,
  aliases: Record<string, z.infer<TKeys>>,
) => {
  const keys = Object.keys(aliases);
  return z.enum(keys).transform((key) => aliases[key]);
};
