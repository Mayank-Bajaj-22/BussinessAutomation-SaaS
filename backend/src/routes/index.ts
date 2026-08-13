import { Router } from "express";

import authRouter from "../modules/auth/auth.routes.js";
import organizationRouter from "../modules/organization/organization.route.js";
import membershipRouter from "../modules/membership/membership.route.js";
import organizationSettingsRouter from "../modules/organization-settings/organization-settings.route.js";
import organizationWorkingHoursRouter from "../modules/organization-working-hours/organization-working-hours.route.js";
import userRouter from "../modules/user/user.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/organizations", organizationRouter);
router.use("/memberships", membershipRouter);
router.use("/organization-settings", organizationSettingsRouter);
router.use("/working-hours", organizationWorkingHoursRouter);
router.use("/users", userRouter);

export default router;