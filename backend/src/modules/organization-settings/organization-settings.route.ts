import express from "express";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { getCurrentOrganizationSettingsController, updateCurrentOrganizationSettingsController } from "./organization-settings.controller.js";
import { validate } from "../../common/middlewares/validate.middleware.js";
import { updateOrganizationSettingsSchema } from "./organization-settings.schema.js";

const router = express.Router();

router
    .route("/current/settings")
    .get(authMiddleware, getCurrentOrganizationSettingsController);

router
    .route("current/settings-update")
    .patch(authMiddleware, validate(updateOrganizationSettingsSchema), updateCurrentOrganizationSettingsController);

export default router;