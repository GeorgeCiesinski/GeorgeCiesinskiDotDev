/**
 * Vercel serverless contact endpoint.
 * Accepts POST JSON, validates input, and emails via Resend.
 * Secrets (RESEND_API_KEY, EMAIL_ADDRESS) stay server-side — never expose them as VITE_*.
 */

import { type ContactRequest } from "../src/types/contact.js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type ContactApiRequest = {
  method?: string;
  body?: ContactRequest | string;
};

type ContactApiResponse = {
  status: (code: number) => ContactApiResponse;
  json: (body: unknown) => ContactApiResponse;
};

/**
 * Basic shape check — not full RFC validation.
 *
 * @param email - Address to validate.
 * @returns True if the string looks like an email.
 */
function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Escape user text before embedding in the HTML email body.
 *
 * @param value - Untrusted string from the form.
 * @returns HTML-safe string with entities escaped.
 */
function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * POST /api/contact
 * Body: { name, email, message, note? } — `note` is a honeypot (silent success if filled).
 *
 * @param req - Incoming request (`method` and JSON or string `body`).
 * @param res - Vercel-style response with fluent `status` / `json`.
 * @returns The same `res` after writing a status and JSON body.
 */
export default async function handler(
  req: ContactApiRequest,
  res: ContactApiResponse,
) {
  // Destination inbox — read per request so tests can stub env.
  const myEmail = process.env.EMAIL_ADDRESS;

  // Vercel usually parses JSON; still support a raw string body.
  let body: ContactRequest;
  try {
    const raw = req.body;
    // Assign to outer `body` — do not use `const body` here (that shadows and leaves outer undefined).
    body = typeof raw === "string" ? JSON.parse(raw) : (raw ?? {});
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const { name, email, message, note } = body;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Honeypot: bots that fill hidden fields get a fake success; no email sent.
  if (note) {
    return res.status(200).json({ answer: "Message sent successfully" });
  }

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email structure" });
  }

  if (!name?.trim()) {
    return res.status(400).json({ error: "Name is empty" });
  }

  if (!message?.trim()) {
    return res.status(400).json({ error: "Message is empty" });
  }

  if (!myEmail) {
    return res.status(500).json({ error: "Configuration problem on server" });
  }

  const htmlContent =
    `Name: ${escapeHtml(name)}<br>` +
    `Email: ${escapeHtml(email)}<br>` +
    `Message: ${escapeHtml(message)}`;

  try {
    const response = await resend.emails.send({
      from: "Portfolio <onboarding@resend.dev>",
      to: myEmail,
      replyTo: email,
      subject: `Contact from portfolio — ${name}`,
      html: htmlContent,
    });

    // Resend often returns { error } instead of throwing.
    if (response.error) {
      console.error("Resend error:", response.error);
      return res.status(500).json({ error: "Failed to send message" });
    }

    return res.status(200).json({ answer: "Message sent successfully" });
  } catch (error) {
    // Unexpected throw from Resend or runtime (not the { error } return shape).
    console.error("Contact handler error:", error);
    return res.status(500).json({ error: "Unknown error" });
  }
}
