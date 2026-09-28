import { Message, MessageDirection, MessageStatus, MessageType } from "@prisma/client";

export interface CreateMessageData {
    conversationId: string;
    providerMessageId?: string | null;
    direction: MessageDirection;
    type?: MessageType;
    body?: string | null;
    status: MessageStatus;
    messageTimestamp: Date;
}

export interface UpdateMessageData {
    status?: MessageStatus;
    body?: string | null;
}

export interface UpdateMessageStatusData {
    messageId: string;
    status: MessageStatus;
    allowedPreviousStatuses: MessageStatus[];
}

export interface IMessageRepository {
    createMessage(data: CreateMessageData): Promise<Message>;
    findMessageById(id: string): Promise<Message | null>;
    findMessageByProviderId(providerMessageId: string): Promise<Message | null>;
    updateMessage(id: string, data: UpdateMessageData): Promise<Message>;
    updateMessageStatusIfAllowed(data: UpdateMessageStatusData): Promise<any | null>;
}