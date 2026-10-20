import express from "express";
import { assignStaffServices, createStaff, getStaffById, listStaff, updateStaff, updateStaffStatus } from "./staff.controller.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";

const router = express.Router();

router.use(
    authMiddleware,
);

router
    .route("/")
    .post(createStaff)
    .get(listStaff);

router
    .route("/:staffId")
    .get(getStaffById)
    .patch(updateStaff);

router
    .route("/:staffId/status")
    .patch(updateStaffStatus);

router
    .route("/:staffId/services")
    .put(assignStaffServices);

export default router;