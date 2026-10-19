import { Prisma } from "@prisma/client";
import { AppError } from "../../common/errors/AppError.js";
import { IStaffRepository } from "./staff.repository.interface.js";
import { AssignStaffServicesDTO, CreateStaffDTO, UpdateStaffDTO } from "./staff.types.js";
import { ListServicesQuery } from "../service/service.types.js";

export class StaffService {
    constructor(
        private readonly staffRepo: IStaffRepository,
    ) {}

    private async ensureUniqueContact(
        organizationId: string,
        input: {
            email?: string | null;
            phone?: string | null;
        },
        excludeStaffId?: string,
    ) {
        if (input.email) {
            const existing = await this.staffRepo.findByEmail(
                organizationId,
                input.email,
            );

            if (existing && existing.id !== excludeStaffId) {
                throw new AppError(
                    "A staff member with this email already exists",
                    409,
                );
            }

            if (input.phone) {
                const existing = await this.staffRepo.findByPhone(
                    organizationId,
                    input.phone,
                );

                if (existing && existing.id !== excludeStaffId) {
                    throw new AppError(
                        "A staff member with this phone already exists",
                        409,
                    );
                }
            }
        }
    }

    private handleDuplicateError(
        error: unknown,
    ): never {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError && 
            error.code === "P2002"
        ) {
            throw new AppError(
                "A staff member with this email or phone already exists",
                409,
            );
        }

        throw error;
    }

    async createStaff(
        organizationId: string,
        input: CreateStaffDTO,
    ) {
        await this.ensureUniqueContact(organizationId, input);

        try {
            return await this.staffRepo.create({
                organizationId,
                ...input,
            });
        } catch (error: unknown) {
            this.handleDuplicateError(error);
        }
    }

    async listStaff(
        organizationId: string,
        query: ListServicesQuery,
    ) {
        const result = await this.staffRepo.list({
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

    async getStaff(
        organizationId: string,
        staffId: string,
    ) {
        const staff = await this.staffRepo.findById(
            organizationId,
            staffId,
        );

        if (!staff) {
            throw new AppError(
                "Staff member not found", 
                404
            );
        }

        return staff;
    }

    async updateStaff(
        organizationId: string,
        staffId: string,
        input: UpdateStaffDTO,
    ) {
        await this.getStaff(organizationId, staffId);
        await this.ensureUniqueContact(
            organizationId,
            input,
            staffId,
        );
        try {
            const staff = await this.staffRepo.update({
                organizationId,
                staffId,
                data: input,
            });

            if (!staff) {
                throw new AppError(
                    "Staff member not found", 
                    404
                );
            }

            return staff;
        } catch (error: unknown) {
            this.handleDuplicateError(error);
        }
    }

    async setStaffStatus(
        organizationId: string,
        staffId: string,
        isActive: boolean,
    ) {
        const staff = await this.staffRepo.updateStatus({
            organizationId,
            staffId,
            isActive,
        });

        if (!staff) {
            throw new AppError(
                "Staff member not found", 
                404
            );
        }

        return staff;
    }

    async assignServices(
        organizationId: string,
        staffId: string,
        input: AssignStaffServicesDTO,
    ) {
        try {
            const result = await this.staffRepo.assignServices({
                organizationId,
                staffId,
                data: input,
            });

            if (!result) {
                throw new AppError(
                    "Staff member not found", 
                    404
                );
            }

            return result;
        } catch (error: unknown) {
            if (
                error instanceof Error &&
                error.message === "STAFF_SERVICE_ORGANIZATION_MISMATCH"
            ) {
                throw new AppError(
                    "One or more services do not belong to this organization",
                    400,
                );
            }

            throw error;
        }
    }
}