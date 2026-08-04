import { IMembershipRepository } from "./membership.repository.interface.js";

export class MembershipService {
    constructor(
        private membershipRepo: IMembershipRepository, 
    ) {}
}