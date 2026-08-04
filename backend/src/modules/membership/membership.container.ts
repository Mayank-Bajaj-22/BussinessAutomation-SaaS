import { MembershipInvitationRepository } from "../membership-invitation/membership-invitation.repository.js";
import { UserRepository } from "../user/user.repository.js";
import { MembershipRepository } from "./membership.repository.js";
import { MembershipService } from "./membership.service.js";

const membershipRepository = new MembershipRepository();
const membershipInvitationRepository = new MembershipInvitationRepository();
const userRespository = new UserRepository(); 
const membershipService = new MembershipService(membershipRepository, membershipInvitationRepository, userRespository);

export { membershipService }