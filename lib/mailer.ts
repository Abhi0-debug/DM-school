import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT ?? 587);
const secure = String(process.env.SMTP_SECURE ?? "false") === "true";
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

export function isMailEnabled() {
  return Boolean(host && user && pass);
}

export function getTransporter() {
  if (!isMailEnabled()) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    }
  });
}

export async function sendContactEmail(payload: {
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  const transporter = getTransporter();

  if (!transporter) {
    return { delivered: false };
  }

  const to = process.env.CONTACT_TO_EMAIL ?? "info@dmpublicschool.edu";
  const from = process.env.CONTACT_FROM_EMAIL ?? "no-reply@dmpublicschool.edu";

  await transporter.sendMail({
    from,
    to,
    subject: `New Contact Message | ${payload.name}`,
    replyTo: payload.email,
    text: `Name: ${payload.name}\nEmail: ${payload.email}\nPhone: ${payload.phone}\n\n${payload.message}`,
    html: `<p><strong>Name:</strong> ${payload.name}</p><p><strong>Email:</strong> ${payload.email}</p><p><strong>Phone:</strong> ${payload.phone}</p><p><strong>Message:</strong><br/>${payload.message}</p>`
  });

  return { delivered: true };
}
