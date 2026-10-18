import { Prisma } from "@prisma/client";
import { AppError } from "../../common/errors/AppError.js";
import { IStaffRepository } from "./staff.repository.interface.js";
import { CreateStaffDTO } from "./staff.types.js";

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
}