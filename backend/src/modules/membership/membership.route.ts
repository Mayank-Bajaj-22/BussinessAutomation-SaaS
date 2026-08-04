import express from "express";

const router = express.Router();

router
    .route("/organizations/current/members/invite")
    .post()

export default router;