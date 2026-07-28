export interface ForgotPasswordTemplateData {
    name: string;
    resetUrl: string;
}

export function forgotPasswordTemplate({
    name,
    resetUrl,
}: ForgotPasswordTemplateData): string {
    return `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f8fafc;padding:40px;">

<div style="max-width:600px;margin:auto;background:#fff;padding:40px;border-radius:8px;">

<h2>Reset Password</h2>

<p>Hi ${name},</p>

<p>
We received a request to reset your password.
</p>

<p style="margin:30px 0;">
<a
href="${resetUrl}"
style="
background:#dc2626;
color:#fff;
padding:12px 24px;
text-decoration:none;
border-radius:6px;
display:inline-block;
">
Reset Password
</a>
</p>

<p>If the button doesn't work:</p>

<p>${resetUrl}</p>

<hr>

<p>If you didn't request this, ignore this email.</p>

</div>

</body>
</html>
`;
}