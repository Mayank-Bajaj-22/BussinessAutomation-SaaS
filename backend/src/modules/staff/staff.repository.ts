import { Prisma, Staff } from "@prisma/client";
import { IAssignStaffServicesData, ICreateStaffData, IListStaffInput, IServiceAssignmentResult, IStaffRepository, IUpdateStaffData, IUpdateStaffStatusData } from "./staff.repository.interface.js";
import { prisma } from "../../lib/prisma.js";

export class StaffRepository implements IStaffRepository {
    async create(data: ICreateStaffData): Promise<Staff> {
        return prisma.staff.create({
            data: {
                organizationId: data.organizationId,
                name: data.name,
                email: data.email ?? null,
                phone: data.phone ?? null,
            },
        });
    }

    async findById(organizationId: string, staffId: string): Promise<Staff | null> {
        return prisma.staff.findFirst({
            where: {
                id: staffId,
                organizationId,
            },
        });
    }

    async findByEmail(organizationId: string, email: string): Promise<Staff | null> {
        return prisma.staff.findFirst({
            where: {
                organizationId,
                email,
            },
        });
    }

    async findByPhone(organizationId: string, phone: string): Promise<Staff | null> {
        return prisma.staff.findFirst({
            where: {
                organizationId,
                phone,
            },
        });
    }

    async list(input: IListStaffInput): Promise<{ items: Staff[]; total: number; }> {
        const { organizationId, query } = input;

        const where: Prisma.StaffWhereInput = {
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
            prisma.staff.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (query.page - 1) * query.limit,
                take: query.limit,
            }),
            prisma.staff.count({ where }),
        ]);

        return { items, total };
    }

    async update(data: IUpdateStaffData): Promise<Staff | null> {
        const { email, phone, ...otherFields } = data.data;

        const updatedData: Prisma.StaffUpdateManyMutationInput = {
            ...otherFields,
            ...(email !== undefined ? { email } : {}),
            ...(phone !== undefined ? { phone } : {}),
        };

        const result = await prisma.staff.updateMany({
            where: {
                id: data.staffId,
                organizationId: data.organizationId,
            },
            data: updatedData,
        });

        if (result.count === 0) {
            return null;
        }

        return this.findById(data.organizationId, data.staffId);
    }

    async updateStatus(data: IUpdateStaffStatusData): Promise<Staff | null> {
        const result = await prisma.staff.updateMany({
            where: {
                id: data.staffId,
                organizationId: data.organizationId,
            },
            data: {
                isActive: data.isActive,
            },
        });

        if (result.count === 0) {
            return null;
        }

        return this.findById(data.organizationId, data.staffId);
    }

    async assignServices(data: IAssignStaffServicesData): Promise<IServiceAssignmentResult | null> {
        const serviceIds = [...new Set(data.data.serviceIds)];

        return prisma.$transaction(async (tx) => {
            const staff = await tx.staff.findFirst({
                where: {
                    id: data.staffId,
                    organizationId: data.organizationId,
                },
            });

            if (!staff) {
                return null;
            }

            const services = await tx.service.findMany({
                where: {
                    organizationId: data.organizationId,
                    id: {
                        in: serviceIds,
                    },
                },
                select: {
                    id: true,
                },
            });

            if (services.length !== serviceIds.length) {
                throw new Error("STAFF_SERVICE_ORGANIZATION_MISMATCH");
            }

            await tx.staffService.deleteMany({
                where: { 
                    staffId: data.staffId 
                },
            });

            if (serviceIds.length > 0) {
                await tx.staffService.createMany({
                    data: serviceIds.map((serviceId) => ({
                        staffId: data.staffId,
                        serviceId,
                    })),
                });
            }

            return {
                staff,
                serviceIds,
            };
        });
    }
}