import { Router } from "express";
import { getAvailability } from "./availability.controller.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";

const router = Router();

router
    .use(authMiddleware);

router
    .route("/")
    .get(getAvailability);

export default router;