/**
 * Unit tests for the /api/contact Vercel serverless handler.
 * Resend is mocked so tests never send real email.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { sendMock } = vi.hoisted(() => ({
  sendMock: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

import handler from "./contact.js";

type MockRes = {
  statusCode?: number;
  jsonBody?: unknown;
  status: (code: number) => MockRes;
  json: (body: unknown) => MockRes;
};

/**
 * Builds a fluent mock of Vercel-style `status` / `json` for handler tests.
 *
 * @returns Mock response that records `statusCode` and `jsonBody`.
 */
function createMockRes(): MockRes {
  const res: MockRes = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.jsonBody = body;
      return this;
    },
  };
  return res;
}

const validBody = {
  name: "Test User",
  email: "test@example.com",
  message: "Hello from tests",
  note: "",
};

describe("POST /api/contact", () => {
  beforeEach(() => {
    sendMock.mockReset();
    sendMock.mockResolvedValue({ data: { id: "email_test" }, error: null });
    vi.stubEnv("EMAIL_ADDRESS", "inbox@example.com");
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns 405 for non-POST methods", async () => {
    const res = createMockRes();
    await handler({ method: "GET", body: validBody }, res);

    expect(res.statusCode).toBe(405);
    expect(res.jsonBody).toEqual({ error: "Method not allowed" });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid JSON string body", async () => {
    const res = createMockRes();
    await handler({ method: "POST", body: "{not-json" }, res);

    expect(res.statusCode).toBe(400);
    expect(res.jsonBody).toEqual({ error: "Invalid JSON body" });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("silently succeeds when honeypot note is filled", async () => {
    const res = createMockRes();
    await handler(
      {
        method: "POST",
        body: { ...validBody, note: "http://spam.example" },
      },
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(res.jsonBody).toEqual({ answer: "Message sent successfully" });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid email", async () => {
    const res = createMockRes();
    await handler(
      { method: "POST", body: { ...validBody, email: "not-an-email" } },
      res,
    );

    expect(res.statusCode).toBe(400);
    expect(res.jsonBody).toEqual({ error: "Invalid email structure" });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("returns 400 when name is blank", async () => {
    const res = createMockRes();
    await handler({ method: "POST", body: { ...validBody, name: "   " } }, res);

    expect(res.statusCode).toBe(400);
    expect(res.jsonBody).toEqual({ error: "Name is empty" });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("returns 400 when message is blank", async () => {
    const res = createMockRes();
    await handler({ method: "POST", body: { ...validBody, message: "" } }, res);

    expect(res.statusCode).toBe(400);
    expect(res.jsonBody).toEqual({ error: "Message is empty" });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("returns 500 when EMAIL_ADDRESS is not configured", async () => {
    vi.stubEnv("EMAIL_ADDRESS", "");
    const res = createMockRes();
    await handler({ method: "POST", body: validBody }, res);

    expect(res.statusCode).toBe(500);
    expect(res.jsonBody).toEqual({
      error: "Configuration problem on server",
    });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("sends email and returns 200 on success", async () => {
    const res = createMockRes();
    await handler({ method: "POST", body: validBody }, res);

    expect(sendMock).toHaveBeenCalledOnce();
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Portfolio <onboarding@resend.dev>",
        to: "inbox@example.com",
        replyTo: "test@example.com",
        subject: "Contact from portfolio — Test User",
        html: expect.stringContaining("Test User"),
      }),
    );
    expect(res.statusCode).toBe(200);
    expect(res.jsonBody).toEqual({ answer: "Message sent successfully" });
  });

  it("parses a JSON string body", async () => {
    const res = createMockRes();
    await handler({ method: "POST", body: JSON.stringify(validBody) }, res);

    expect(res.statusCode).toBe(200);
    expect(sendMock).toHaveBeenCalledOnce();
  });

  it("escapes HTML in the email body", async () => {
    const res = createMockRes();
    await handler(
      {
        method: "POST",
        body: {
          ...validBody,
          name: '<script>alert("x")</script>',
          message: "Hi & bye <b>bold</b>",
        },
      },
      res,
    );

    const payload = sendMock.mock.calls[0]?.[0] as { html: string };
    expect(payload.html).toContain("&lt;script&gt;");
    expect(payload.html).toContain("&amp;");
    expect(payload.html).not.toContain("<script>");
    expect(res.statusCode).toBe(200);
  });

  it("returns 500 when Resend returns an error object", async () => {
    sendMock.mockResolvedValue({
      data: null,
      error: { message: "rate limited", name: "rate_limit_exceeded" },
    });
    const res = createMockRes();
    await handler({ method: "POST", body: validBody }, res);

    expect(res.statusCode).toBe(500);
    expect(res.jsonBody).toEqual({ error: "Failed to send message" });
  });

  it("returns 500 when Resend throws", async () => {
    sendMock.mockRejectedValue(new Error("network down"));
    const res = createMockRes();
    await handler({ method: "POST", body: validBody }, res);

    expect(res.statusCode).toBe(500);
    expect(res.jsonBody).toEqual({ error: "Unknown error" });
  });
});
