import { MessageStatus } from "@prisma/client";
import { AppError } from "../../../common/errors/AppError.js";

export function mapMetaStatusToMessageStatus(
    status: string,
): MessageStatus {
    switch(status) {
        case "sent":
            return MessageStatus.SENT;

        case "delivered":
            return MessageStatus.DELIVERED;

        case "read":
            return MessageStatus.READ;

        case "failed":
            return MessageStatus.FAILED;

        default:
            throw new AppError(
                `Unsupported WhatsApp message status: ${status}`,
                400,
            );
    }
}