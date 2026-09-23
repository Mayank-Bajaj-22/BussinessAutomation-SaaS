import express from "express";
import { verify } from "./webhook.controller.js";

const router = express.Router();

router
    .route("/")
    .get(verify);

export default router;