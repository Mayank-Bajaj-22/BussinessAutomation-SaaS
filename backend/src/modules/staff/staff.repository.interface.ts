import { Staff } from "@prisma/client";
import { AssignStaffServicesDTO, CreateStaffDTO, ListStaffQuery, UpdateStaffDTO } from "./staff.types.js";

export interface ICreateStaffData extends CreateStaffDTO {
    organizationId: string;
}

export interface IListStaffInput {
    organizationId: string;
    query: ListStaffQuery;
}

export interface IUpdateStaffData {
    organizationId: string;
    staffId: string;
    data: UpdateStaffDTO;
}

export interface IUpdateStaffStatusData {
    organizationId: string;
    staffId: string;
    isActive: boolean;
}

export interface IAssignStaffServicesData {
    organizationId: string;
    staffId: string;
    data: AssignStaffServicesDTO;
}

export interface IServiceAssignmentResult {
    staff: Staff;
    serviceIds: string[];
}

export interface IStaffRepository {
    create(data: ICreateStaffData): Promise<Staff>;
    findById(organizationId: string, staffId: string): Promise<Staff | null>;
    findByEmail(organizationId: string, email: string): Promise<Staff | null>;
    findByPhone(organizationId: string, phone: string): Promise<Staff | null>;
    list(input: IListStaffInput): Promise<{ items: Staff[], total: number }>;
    update(data: IUpdateStaffData): Promise<Staff | null>;
    updateStatus(data: IUpdateStaffStatusData): Promise<Staff | null>;
    assignServices(data: IAssignStaffServicesData): Promise<IServiceAssignmentResult | null>;
}