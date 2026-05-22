interface ResetEmailPayload {
  toEmail: string;
  code: string;
  name?: string;
}

const EMAILJS_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";

export async function sendPasswordResetEmail({ toEmail, code, name }: ResetEmailPayload) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    return {
      ok: false,
      error: "EmailJS n'est pas configuré. Ajoutez VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID et VITE_EMAILJS_PUBLIC_KEY dans .env.",
    };
  }

  const response = await fetch(EMAILJS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        to_email: toEmail,
        user_email: toEmail,
        user_name: name || toEmail.split("@")[0],
        verification_code: code,
        code,
      },
    }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    return { ok: false, error: message || "Email non envoyé. Vérifiez la configuration EmailJS." };
  }

  return { ok: true };
}
