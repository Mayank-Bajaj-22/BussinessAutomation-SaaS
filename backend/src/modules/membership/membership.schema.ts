import { MembershipRole } from "@prisma/client";
import z from "zod";

export const inviteMemberSchema = z
    .object({
        email: z.email("Invalid email address"),
        role: z.enum(MembershipRole).refine(
            (role) => role !== MembershipRole.OWNER,
            {
                message: "OWNER role cannot be assigned."
            },
        ),
    })
    .strict();

export type InviteMemberDto = z.infer<typeof inviteMemberSchema>;