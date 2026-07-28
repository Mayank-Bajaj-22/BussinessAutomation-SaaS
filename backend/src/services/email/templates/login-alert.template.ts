export interface LoginAlertTemplateData {
    name: string;
    ipAddress: string;
    userAgent: string;
    location?: string;
}

export function loginAlertTemplate({
    name,
    ipAddress,
    userAgent,
    location,
}: LoginAlertTemplateData): string {
    return `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f8fafc;padding:40px;">

<div style="max-width:600px;margin:auto;background:#fff;padding:40px;border-radius:8px;">

<h2>New Login Detected</h2>

<p>Hi ${name},</p>

<p>
A new login to your account was detected.
</p>

<ul>
<li><strong>IP:</strong> ${ipAddress}</li>
<li><strong>Device:</strong> ${userAgent}</li>
<li><strong>Location:</strong> ${location ?? "Unknown"}</li>
</ul>

<p>
If this wasn't you,
please change your password immediately.
</p>

</div>

</body>
</html>
`;
}