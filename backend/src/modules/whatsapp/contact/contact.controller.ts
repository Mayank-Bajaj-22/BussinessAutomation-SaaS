import { Request, Response } from "express";
import { CatchAsync } from "../../../common/utils/CatchAsync.js";
import { getAccountId, getContactId, getOrganizationId } from "../whatsapp.helper.js";
import { contactService } from "./contact.container.js";
import { sendResponse } from "../../../common/utils/sendResponse.js";
import { mapContactToResponse } from "./contact.mapper.js";
import { ListContactsQueryDTO } from "./contact.schema.js";

export const createContact = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const accountId = getAccountId(req);

        const { phoneNumber, name } = req.body;

        const contact = await contactService.createContact(
            organizationId,
            accountId,
            {
                organizationId,
                whatsappAccountId: accountId,
                phoneNumber,
                name,
            },
        );

        sendResponse(res, 201, {
            success: true,
            message: "Contact created successfully.",
            data: mapContactToResponse(
                contact,
            ),
        });
    },
);

export const getContact = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const accountId = getAccountId(req);
        const contactId = getContactId(req);

        const contact = await contactService.getContact(
            organizationId,
            accountId,
            contactId,
        );

        sendResponse(res, 200, {
            success: true,
            message: "Contact fetched successfully.",
            data: mapContactToResponse(
                contact,
            ),
        });
    },
);

export const getContacts = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const accountId = getAccountId(req);

        const { page, limit, search } = res.locals.validated.query as unknown as ListContactsQueryDTO;

        const result = await contactService.listContacts(
            organizationId,
            accountId,
            {
                page,
                limit,
                search,
            },
        );

        const totalPages = Math.ceil(result.total / limit);

        sendResponse(res, 200, {
            success: true,
            message: "Contacts fetched successfully.",
            data: {
                contacts: result.contacts.map(
                    mapContactToResponse,
                ),
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                },
            },
        });
    },
);

export const updateContact = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const accountId = getAccountId(req);
        const contactId = getContactId(req);

        const { phoneNumber, name } = req.body;

        const contact = await contactService.updateContact(
            organizationId,
            accountId,
            contactId,
            {
                phoneNumber,
                name,
            },
        );

        sendResponse(res, 200, {
            success: true,
            message: "Contact updated successfully.",
            data: mapContactToResponse(
                contact,
            ),
        });
    },
);

export const deleteContact = CatchAsync(
    async (req: Request, res: Response) => {
        const organizationId = getOrganizationId(req);
        const accountId = getAccountId(req);
        const contactId = getContactId(req);

        const contact = await contactService.deleteContact(
            organizationId,
            accountId,
            contactId,
        );

        sendResponse(res, 200, {
            success: true,
            message: "Contact deleted successfully.",
            data: mapContactToResponse(
                contact,
            ),
        });
    },
);