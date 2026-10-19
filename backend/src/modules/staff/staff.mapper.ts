import { Staff } from "@prisma/client";

export const toStaffResponse = (staff: Staff) => ({
    id: staff.id,
    organizationId: staff.organizationId,
    name: staff.name,
    email: staff.email,
    phone: staff.phone,
    isActive: staff.isActive,
    createdAt: staff.createdAt,
    updatedAt: staff.updatedAt,
});