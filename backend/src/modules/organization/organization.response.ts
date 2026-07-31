import { OrganizationStatus } from "@prisma/client";

export interface OrganizationResponseDTO {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    address: string | null;
    website: string | null;
    phone: string | null;
    status: OrganizationStatus;
    createdAt: Date;
    updatedAt: Date;
}