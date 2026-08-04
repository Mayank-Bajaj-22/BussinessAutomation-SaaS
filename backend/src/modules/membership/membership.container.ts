import { MembershipRepository } from "./membership.repository.js";
import { MembershipService } from "./membership.service.js";

const membershipRepository = new MembershipRepository();
const membershipService = new MembershipService(membershipRepository);

export { membershipService }