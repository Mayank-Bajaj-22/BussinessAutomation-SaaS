import { OrganizationStatus } from "@prisma/client";

export interface OrganizationResponseDTO {
    id: string;
    name: string;
    slug: string;
    timezone: string;
    address: string | null;
    status: OrganizationStatus;
    createdAt: Date;
    updatedAt: Date;
}