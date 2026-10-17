import { Service } from "@prisma/client";
import { CreateServiceDTO, ListServicesQuery, UpdateServiceDTO } from "./service.types.js";

export interface ICreateServiceData extends CreateServiceDTO {
    organizationId: string;
}

export interface IListServiceInput {
    organizationId: string;
    query: ListServicesQuery;
}

export interface IUpdateServiceData {
    organizationId: string;
    serviceId: string;
    data: UpdateServiceDTO;
}

export interface IUpdateServiceStatusData {
    organizationId: string;
    serviceId: string;
    isActive: boolean;
}

export interface IServiceRepository {
    create(data: ICreateServiceData): Promise<Service>;
    findById(organizationId: string, serviceId: string): Promise<Service | null>;
    findByName(organizationId: string, name: string): Promise<Service | null>;
    list(input: IListServiceInput): Promise<{ items: Service[], total: number }>;
    update(data: IUpdateServiceData): Promise<Service | null>;
    updateStatus(data: IUpdateServiceStatusData): Promise<Service | null>;
}