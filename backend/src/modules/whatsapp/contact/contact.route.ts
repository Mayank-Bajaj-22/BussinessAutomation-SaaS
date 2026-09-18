import express from "express";
import { authMiddleware } from "../../../common/middlewares/auth.middleware.js";
import { validate } from "../../../common/middlewares/validate.middleware.js";
import { createContactSchema, listContactsQuerySchema, updateContactSchema } from "./contact.schema.js";
import { createContact, deleteContact, getContact, getContacts, updateContact } from "./contact.controller.js";

const router = express.Router();

router
    .route("/accounts/:accountId/contacts")
    .post(
        validate(createContactSchema),
        createContact,
    )
    .get(
        validate(listContactsQuerySchema, "query"),
        getContacts,
    );


router
    .route("/accounts/:accountId/contacts/:contactId")
    .get(
        getContact,
    )
    .patch(
        validate(updateContactSchema),
        updateContact,
    )
    .delete(
        deleteContact,
    );

export default router;