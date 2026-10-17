import { Prisma } from "@prisma/client";

import {
    CreateServiceInput,
    ServiceListQuery,
    UpdateServiceInput,
} from "./service.schema.js";

export type CreateServiceDTO = CreateServiceInput;
export type UpdateServiceDTO = UpdateServiceInput;
export type ListServicesQuery = ServiceListQuery;

export interface ServiceListResult {
    items: Prisma.ServiceGetPayload<object>[];
    total: number;
    page: number;
    limit: number;
}