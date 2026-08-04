import express from "express";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { organizationMiddleware } from "../../common/middlewares/organization.middleware.js";
import { authorize } from "../../common/middlewares/authorize.middleware.js";
import { MembershipRole } from "@prisma/client";
import { validate } from "../../common/middlewares/validate.middleware.js";
import { inviteMemberSchema } from "./membership.schema.js";
import { memberInviteController } from "./membership.controller.js";

const router = express.Router();

router
    .route("/organizations/current/members/invite")
    .post(
        authMiddleware, 
        organizationMiddleware, 
        authorize(MembershipRole.OWNER, MembershipRole.ADMIN), 
        validate(inviteMemberSchema),
        memberInviteController,
    );

export default router;