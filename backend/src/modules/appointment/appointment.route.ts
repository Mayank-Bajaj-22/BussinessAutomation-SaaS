import express from "express";
import {
    createAppointment,
    getAppointmentById,
    listAppointments,
    updateAppointmentStatus,
} from "./appointment.controller.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";

const router = express.Router();

router.use(
    authMiddleware,
);

router
    .route("/")
    .post(createAppointment)
    .get(listAppointments);

router
    .route("/:appointmentId")
    .get(getAppointmentById);

router
    .route("/:appointmentId/status")
    .patch(updateAppointmentStatus);

export default router;