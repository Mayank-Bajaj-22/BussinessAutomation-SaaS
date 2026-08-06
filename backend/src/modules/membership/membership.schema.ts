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

export const acceptInvitationSchema = z
    .object({
        token: z.string().trim().min(1, "Invitation token is required."),
    })
    .strict();

export const rejectInvitationSchema = z
    .object({
        token: z.string().trim().min(1),
    })
    .strict();

export type InviteMemberDto = z.infer<typeof inviteMemberSchema>;
export type AcceptInvitationDTO = z.infer<typeof acceptInvitationSchema>;
export type RejectInvitationDTO = z.infer<typeof rejectInvitationSchema>;