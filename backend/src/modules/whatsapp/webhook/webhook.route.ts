import express from "express";
import { receive, verify } from "./webhook.controller.js";

const router = express.Router();

router
    .route("/")
    .get(verify)
    .post(receive);

export default router;