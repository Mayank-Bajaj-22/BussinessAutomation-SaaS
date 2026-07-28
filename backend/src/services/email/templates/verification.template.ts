export interface VerificationTemplateData {
    name: string;
    verificationUrl: string;
}

export function verificationTemplate({
    name,
    verificationUrl,
}: VerificationTemplateData): string {
    return `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f8fafc;padding:40px;">

<div style="max-width:600px;margin:auto;background:#fff;padding:40px;border-radius:8px;">

<h2>Verify your email</h2>

<p>Hi ${name},</p>

<p>
Thank you for creating your account.
Please verify your email by clicking the button below.
</p>

<p style="margin:30px 0;">
<a
href="${verificationUrl}"
style="
background:#2563eb;
color:#fff;
padding:12px 24px;
text-decoration:none;
border-radius:6px;
display:inline-block;
">
Verify Email
</a>
</p>

<p>If the button doesn't work, use this link:</p>

<p>${verificationUrl}</p>

<hr>

<p>If you didn't create this account, simply ignore this email.</p>

</div>

</body>
</html>
`;
}