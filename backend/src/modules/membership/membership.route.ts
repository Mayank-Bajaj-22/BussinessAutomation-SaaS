import express from "express";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { organizationMiddleware } from "../../common/middlewares/organization.middleware.js";
import { authorize } from "../../common/middlewares/authorize.middleware.js";
import { MembershipRole } from "@prisma/client";
import { validate } from "../../common/middlewares/validate.middleware.js";
import { acceptInvitationSchema, changeMemberRoleSchema, inviteMemberSchema } from "./membership.schema.js";
import { acceptInvitationController, activateMemberController, cancelInvitationController, changeMemberRoleController, getMembersByIdController, getMembersController, memberInviteController, rejectInvitationController, removeMemberController, suspendMemberController } from "./membership.controller.js";

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

router
    .route("/organizations/invitations/accept")
    .post(
        validate(acceptInvitationSchema), 
        acceptInvitationController,
    );

router
    .route("/organizations/invitations/reject")
    .post(
        validate(acceptInvitationSchema), 
        rejectInvitationController,
    );

router
    .route("/organizations/current/members")
    .get(
        authMiddleware,
        organizationMiddleware,
        authorize(
            MembershipRole.OWNER,
            MembershipRole.ADMIN,
        ),
        getMembersController,
    );

router
    .route("/organizations/current/members/:membershipId")
    .get(
        authMiddleware,
        organizationMiddleware,
        authorize(
            MembershipRole.OWNER,
            MembershipRole.ADMIN,
        ),
        getMembersByIdController,
    );

router
    .route("/organizations/current/members/:membershipId/role")
    .patch(
        authMiddleware,
        organizationMiddleware,
        authorize(
            MembershipRole.OWNER,
            MembershipRole.ADMIN,
        ),
        validate(changeMemberRoleSchema),
        changeMemberRoleController,
    );

router
    .route("/organizations/current/members/:membershipId/suspend")
    .patch(
        authMiddleware,
        organizationMiddleware,
        authorize(
            MembershipRole.ADMIN,
            MembershipRole.OWNER,
        ),
        suspendMemberController,
    );

router
    .route("/organizations/current/members/:membershipId/activate")
    .patch(
        authMiddleware,
        organizationMiddleware,
        authorize(
            MembershipRole.ADMIN,
            MembershipRole.OWNER,
        ),
        activateMemberController,
    );

router
    .route("/organizations/current/members/:membershipId")
    .delete(
        authMiddleware,
        organizationMiddleware,
        authorize(
            MembershipRole.OWNER,
            MembershipRole.ADMIN,
        ),
        removeMemberController,
    );

router
    .route("/organizations/current/members/:membershipId/invitation")
    .delete(
        authMiddleware,
        organizationMiddleware,
        authorize(
            MembershipRole.OWNER,
            MembershipRole.ADMIN,
        ),
        cancelInvitationController,
    );

export default router;