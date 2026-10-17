import express from "express";
import { createService, getById, list, update, updateStatus } from "./service.controller.js";

const router = express.Router();

router.use();

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