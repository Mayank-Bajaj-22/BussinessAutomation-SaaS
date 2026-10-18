import express from "express";
import { createService, getById, list, update, updateStatus } from "./service.controller.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router
    .route("/")
    .post(createService)
    .get(list);

router
    .route("/:serviceId")
    .get(getById)
    .patch(update);

router
    .route("/:serviceId/status")
    .patch(updateStatus);

export default router;