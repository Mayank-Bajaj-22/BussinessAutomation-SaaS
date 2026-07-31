import express from "express";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { getCurrentOrganizationController } from "./organization.controller.js";

const router = express.Router();

router
    .route("/current")
    .get(authMiddleware, getCurrentOrganizationController);

export default router;