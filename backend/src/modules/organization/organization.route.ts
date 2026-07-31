import express from "express";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { getCurrentOrganizationController, updateCurrentOrganizationController } from "./organization.controller.js";
import { validate } from "../../common/middlewares/validate.middleware.js";
import { updateOrganizationSchema } from "./organization.schema.js";

const router = express.Router();

router
    .route("/current")
    .get(authMiddleware, getCurrentOrganizationController);

router
    .route("/update-current")
    .patch(authMiddleware, validate(updateOrganizationSchema), updateCurrentOrganizationController);

export default router;