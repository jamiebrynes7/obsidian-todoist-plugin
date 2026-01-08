import { z } from "zod";

export const userInfoSchema = z.object({
  isPremium: z.boolean(),
});

export type UserInfo = z.infer<typeof userInfoSchema>;
