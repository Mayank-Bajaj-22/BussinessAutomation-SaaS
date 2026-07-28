export interface PasswordChangedTemplateData {
    name: string;
}

export function passwordChangedTemplate({
    name,
}: PasswordChangedTemplateData): string {
    return `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f8fafc;padding:40px;">

<div style="max-width:600px;margin:auto;background:#fff;padding:40px;border-radius:8px;">

<h2>Password Changed Successfully 🔒</h2>

<p>Hi ${name},</p>

<p>
Your account password has been changed successfully.
</p>

<p>
For your security, all active sessions have been logged out.
Please sign in again using your new password.
</p>

<p>
If you did not make this change, please reset your password immediately
or contact our support team.
</p>

<hr>

<p>
This is an automated security notification.
Please do not reply to this email.
</p>

</div>

</body>
</html>
`;
}