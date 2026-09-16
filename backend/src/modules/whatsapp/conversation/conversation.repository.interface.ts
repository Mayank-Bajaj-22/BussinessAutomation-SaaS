import { Conversation, ConversationStatus } from "@prisma/client";

export interface CreateConversationData {
    organizationId: string;
    whatsappAccountId: string;
    contactId: string;
    status?: ConversationStatus;
    lastMessageAt?: Date;
}

export interface UpdateConversationData {
    status?: ConversationStatus;
    lastMessageAt?: Date;
}

export interface IConversationRepository {
    createConversation(
        data: CreateConversationData,
    ) : Promise<Conversation>;
    
    findConversationById(
        id: string,
    ) : Promise<Conversation | null>;
    
    findOpenConversation(
        whatsappAccountId: string,
        contactId: string,
    ) : Promise<Conversation | null>;
    
    updateConversation(
        id: string,
        data: UpdateConversationData,
    ): Promise<Conversation>;
}