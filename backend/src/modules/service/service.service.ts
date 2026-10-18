import { Prisma } from "@prisma/client";
import { IServiceRepository } from "./service.repository.interface.js";
import { CreateServiceDTO, ListServicesQuery, UpdateServiceDTO } from "./service.types.js";
import { AppError } from "../../common/errors/AppError.js";

export class ServiceService {
    constructor(
        private readonly serviceRepo: IServiceRepository,
    ) {}

    async createService(
        organizationId: string,
        input: CreateServiceDTO,
    ) {
        const normalizedInput = {
            ...input,
            name: input.name.trim(),
        };

        const existing = 
            await this.serviceRepo.findByName(
                organizationId,
                normalizedInput.name,
            );

        if (existing) {
            throw new AppError(
                "A service with this name already exists",
                409,
            );
        }

        try {
            return await this.serviceRepo.create({
                ...input,
                organizationId,
            });
        } catch (error: unknown) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002"
            ) {
                throw new AppError(
                    "A service with this name already exists",
                    409,
                );
            }

            throw error;
        }
    }

    async listService(
        organizationId: string,
        query: ListServicesQuery,
    ) {
        const result = 
            await this.serviceRepo.list({
                organizationId,
                query,
            });

        return {
            ...result,
            page: query.page,
            limit: query.limit,
            totalPages: Math.ceil(result.total / query.limit),
        };
    }

    async getService(
        organizationId: string,
        serviceId: string,
    ) {
        const service = 
            await this.serviceRepo.findById(
                organizationId,
                serviceId,
            );

        if (!service) {
            throw new AppError(
                "Service not found", 
                404
            );
        }

        return service;
    }

    async updateService(
        organizationId: string,
        serviceId: string,
        input: UpdateServiceDTO,
    ) {
        await this.getService(organizationId, serviceId);

        if (input.name !== undefined) {
            const existing = 
                await this.serviceRepo.findByName(
                    organizationId,
                    input.name,
                );

            if (existing && existing.id !== serviceId) {
                throw new AppError(
                    "A service with this name already exists",
                    409,
                );
            }
        }

        try {
            const updated = 
                await this.serviceRepo.update({
                    organizationId,
                    serviceId,
                    data: input,
                });

            if (!updated) {
                throw new AppError(
                    "Service not found", 
                    404
                );
            }

            return updated;
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002"
            ) {
                throw new AppError(
                    "A service with this name already exists",
                    409,
                );
            }

            throw error;
        }
    }

    async setServiceStatus(
        organizationId: string,
        serviceId: string,
        isActive: boolean,
    ) {
        const service = 
            await this.serviceRepo.updateStatus({
                organizationId,
                serviceId,
                isActive,
            });

        if (!service) {
            throw new AppError(
                "Service not found", 
                404
            );
        }

        return service;
    }
}