"use client";

import { FormEvent, useState } from "react";
import { Mail } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to subscribe");
      }

      setStatus("success");
      setMessage(payload.message ?? "Subscribed successfully.");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Something went wrong. Try again."
      );
    }
  };

  return (
    <section className="section-shell section-spacing">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-brand-50 to-white p-6 shadow-soft dark:border-slate-700 dark:from-brand-900/25 dark:to-slate-900 sm:p-8">
        <SectionHeading
          title="Newsletter"
          subtitle="Get School Updates In Your Inbox"
        />
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="newsletter-email">
            Email
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            className="h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none ring-brand-300 transition focus:ring dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Mail className="h-4 w-4" />
            {status === "loading" ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
        {message ? (
          <p
            className={`mt-3 text-sm ${
              status === "success"
                ? "text-emerald-600 dark:text-emerald-300"
                : "text-rose-600 dark:text-rose-300"
            }`}
          >
            {message}
          </p>
        ) : null}
      </div>
    </section>
  );
}
