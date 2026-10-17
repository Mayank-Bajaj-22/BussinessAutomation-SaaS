import { Service } from "@prisma/client";

export const toServiceResponse = (service: Service) => ({
    id: service.id,
    organizationId: service.organizationId,
    name: service.name,
    description: service.description,
    durationMinutes: service.durationMinutes,
    price: service.price.toFixed(2),
    isActive: service.isActive,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
});