export interface WelcomeTemplateData {
    name: string;
}

export function welcomeTemplate({
    name,
}: WelcomeTemplateData): string {
    return `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f8fafc;padding:40px;">

<div style="max-width:600px;margin:auto;background:#fff;padding:40px;border-radius:8px;">

<h2>Welcome 🎉</h2>

<p>Hi ${name},</p>

<p>
Welcome to our platform.
</p>

<p>
Your account has been successfully created.
</p>

<p>
We're excited to have you with us.
</p>

</div>

</body>
</html>
`;
}