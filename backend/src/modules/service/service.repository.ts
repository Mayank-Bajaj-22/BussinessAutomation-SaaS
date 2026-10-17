import { Prisma, Service } from "@prisma/client";
import { ICreateServiceData, IListServiceInput, IServiceRepository, IUpdateServiceData, IUpdateServiceStatusData } from "./service.repository.interface.js";
import { prisma } from "../../lib/prisma.js";

export class ServiceRepository implements IServiceRepository {
    async create(data: ICreateServiceData): Promise<Service> {
        return prisma.service.create({
            data: {
                organizationId: data.organizationId,
                name: data.name,
                description: data.description,
                durationMinutes: data.durationMinutes,
                price: new Prisma.Decimal(data.price.toFixed(2)),
            },
        });
    }

    async findById(organizationId: string, serviceId: string): Promise<Service | null> {
        return prisma.service.findFirst({
            where: {
                id: serviceId,
                organizationId,
            },
        });
    }

    async findByName(organizationId: string, name: string): Promise<Service | null> {
        return prisma.service.findFirst({
            where: {
                organizationId,
                name,
            },
        });
    }

    async list(input: IListServiceInput): Promise<{ items: Service[]; total: number; }> {
        const { organizationId, query } = input;

        const where: Prisma.ServiceWhereInput = {
            organizationId,
            ...(query.isActive !== undefined
                ? { isActive: query.isActive === "true" }
                : {}
            ),
            ...(query.search
                ? {
                    name: {
                        contains: query.search,
                        mode: "insensitive",
                    },
                }
                : {}
            ),
        };

        const [items, total] = await prisma.$transaction([
            prisma.service.findMany({
                where,
                orderBy: {
                    createdAt: "desc",
                },
                skip: (query.page - 1) * query.limit,
                take: query.limit,
            }),
            prisma.service.count({ where }),
        ]);

        return { items, total };
    }

    async update(data: IUpdateServiceData): Promise<Service | null> {
        const { price, ...otherFields } = data.data;

        const updateData: Prisma.ServiceUpdateManyMutationInput = {
            ...otherFields,
            ...(price !== undefined
                ? { price: new Prisma.Decimal(price.toFixed(2)) }
                : {}
            ),
        };

        const result = 
            await prisma.service.updateMany({
                where: {
                    id: data.serviceId,
                    organizationId: data.organizationId,
                },
                data: updateData,
            });

        if (result.count == 0) {
            return null;
        }

        return this.findById(data.organizationId, data.serviceId);
    }

    async updateStatus(data: IUpdateServiceStatusData): Promise<Service | null> {
        const result = 
            await prisma.service.updateMany({
                where: {
                    id: data.serviceId,
                    organizationId: data.organizationId,
                },
                data: {
                    isActive: data.isActive,
                }
            });

        if (result.count === 0) {
            return null;
        }

        return this.findById(data.organizationId, data.serviceId);
    }
}