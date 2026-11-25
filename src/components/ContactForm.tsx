/**
 * Contact form that POSTs JSON to the Vercel `/api/contact` serverless function.
 */

import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Renders the portfolio contact form (name, email, message, honeypot).
 * On success, navigates to `/success`; on failure, shows an inline error.
 *
 * @returns The contact form element.
 */
export function ContactForm() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Submits form fields as JSON to `/api/contact` after `preventDefault`.
   * Sets `submitting`, includes the honeypot field, and updates error state
   * on failure.
   *
   * @param event - React submit event for the contact `<form>`.
   * @returns Resolves when the request finishes (success navigate or error state).
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      message: String(formData.get("message") ?? ""),
      note: String(formData.get("note") ?? ""),
    };

    setSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      navigate("/success");
    } catch {
      setError("Something went wrong. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form__field">
        <label className="form__label" htmlFor="name">
          Name
        </label>
        <input
          className="form__input"
          id="name"
          name="name"
          type="text"
          placeholder="John Smith"
          required
          autoComplete="name"
        />
      </div>

      <div className="form__field">
        <label className="form__label" htmlFor="email">
          Email
        </label>
        <input
          className="form__input"
          id="email"
          name="email"
          type="email"
          placeholder="example@example.com"
          required
          autoComplete="email"
        />
      </div>

      <div className="form__field">
        <label className="form__label" htmlFor="message">
          Message
        </label>
        <textarea
          className="form__textarea"
          id="message"
          name="message"
          rows={4}
          placeholder="Hey, how's it going?"
          required
        />
      </div>

      {/* hidden via CSS */}
      <input
        className="form__note"
        type="text"
        name="note"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      {error ? <p className="form__error">{error}</p> : null}

      <div className="form__actions">
        <button
          className="btn btn--primary"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Sending…" : "Submit"}
        </button>
      </div>
    </form>
  );
}
