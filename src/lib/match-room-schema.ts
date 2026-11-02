import { z } from "zod";

export const createMatchRoomSchema = z.object({
  title: z.string().trim().min(3).max(80),
  homeTeam: z.string().trim().min(1).max(40),
  awayTeam: z.string().trim().min(1).max(40),
  kickoffAt: z.string().datetime(),
  pollQuestion: z.string().trim().min(3).max(120),
  pollOptions: z.array(z.string().trim().min(1).max(50)).min(2).max(4),
});

export const joinMatchRoomSchema = z.object({
  displayName: z.string().trim().min(1).max(30),
  scorePrediction: z.string().trim().max(20).optional(),
  pollChoice: z.string().trim().max(50).optional(),
});

export const banterMessageSchema = z.object({
  displayName: z.string().trim().min(1).max(30),
  message: z.string().trim().min(2).max(180)
    .refine((value) => !/(?:https?:\/\/|www\.)/i.test(value), "Links are not allowed in the Banter Room")
    .refine((value) => !/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value), "Unsupported characters"),
  team: z.string().trim().max(40).optional(),
});
