import express from "express";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { getCurrentWorkingHoursController, updateCurrentWorkingHoursController } from "./organization-working-hours.controller.js";
import { validate } from "../../common/middlewares/validate.middleware.js";
import { updateOrganizationWorkingHoursSchema } from "./organization-working-hours.schema.js";

const router = express.Router();

router
    .route("/current/working-hours")
    .get(authMiddleware, getCurrentWorkingHoursController);

router
    .route("/current/working-hours-update")
    .put(authMiddleware, validate(updateOrganizationWorkingHoursSchema), updateCurrentWorkingHoursController);

export default router;