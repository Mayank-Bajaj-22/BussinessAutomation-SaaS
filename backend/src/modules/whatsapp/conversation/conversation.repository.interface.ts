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

export interface ListConversationsParams {
    page: number;
    limit: number;
    status?: ConversationStatus;
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

    findConversationsByAccount(
        whatsappAccountId: string,
        params: ListConversationsParams,
    ) : Promise<{
        conversations: Conversation[];
        total: number;
    }>;

    findConversationsByContact(
        contactId: string,
        params: ListConversationsParams,
    ) : Promise<{
        conversations: Conversation[];
        total: number;
    }>;
}