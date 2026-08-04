interface MembershipInvitationTemplateProps {
    inviterName: string;
    organizationName: string;
    invitationUrl: string;
    role: string;
}

export const membershipInvitationTemplate = (
    params: MembershipInvitationTemplateProps,
): string => {
    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Organization Invitation</title>
</head>

<body style="font-family: Arial, sans-serif; background:#f8fafc; padding:40px;">

<div style="max-width:600px;margin:auto;background:#ffffff;padding:40px;border-radius:10px;">

<h2>You're Invited 🎉</h2>

<p>Hello,</p>

<p>
<strong>${params.inviterName}</strong>
has invited you to join
<strong>${params.organizationName}</strong>.
</p>

<p>
Your assigned role is:
<strong>${params.role}</strong>
</p>

<p style="margin:30px 0;">
<a
href="${params.invitationUrl}"
style="
background:#2563eb;
color:#fff;
padding:12px 24px;
text-decoration:none;
border-radius:6px;
display:inline-block;
">
Accept Invitation
</a>
</p>

<p>
If the button doesn't work, copy this URL:
</p>

<p>${params.invitationUrl}</p>

<p>
This invitation expires in 7 days.
</p>

<p>
If you weren't expecting this invitation,
you can safely ignore this email.
</p>

</div>

</body>
</html>
`;
};