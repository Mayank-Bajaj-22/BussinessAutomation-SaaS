import { MessageStatus } from "@prisma/client";

export const getAllowedPreviousStatuses = (
    nextStatus: MessageStatus,
): MessageStatus[] => {
    switch(nextStatus) {
        case MessageStatus.SENT:
            return [
                MessageStatus.SENT,
            ];

        case MessageStatus.DELIVERED:
            return [
                MessageStatus.SENT,
                MessageStatus.DELIVERED,
            ];

        case MessageStatus.READ:
            return [
                MessageStatus.SENT,
                MessageStatus.DELIVERED,
                MessageStatus.READ,
            ];

        case MessageStatus.FAILED:
            return [
                MessageStatus.SENT,
                MessageStatus.FAILED,
            ];

        case MessageStatus.RECEIVED:
            return [
                MessageStatus.RECEIVED,
            ];
    }
};