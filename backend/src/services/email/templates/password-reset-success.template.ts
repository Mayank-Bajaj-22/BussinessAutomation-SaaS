export interface PasswordResetSuccessTemplateData {
    name: string;
}

export function passwordResetSuccessTemplate({
    name,
}: PasswordResetSuccessTemplateData): string {
    return `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f8fafc;padding:40px;">

<div style="max-width:600px;margin:auto;background:#fff;padding:40px;border-radius:8px;">

<h2>Password Reset Successful ✅</h2>

<p>Hi ${name},</p>

<p>
Your account password has been successfully reset.
</p>

<p>
You can now sign in using your new password.
</p>

<p>
If you did not perform this action, your account may have been compromised.
Please contact our support team immediately.
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