"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { siteConfig } from "@/lib/site-config";
import { ContactSettings } from "@/lib/types";

interface ContactFormState {
  name: string;
  email: string;
  phone: string;
  message: string;
  captchaAnswer: string;
}

function getCaptchaChallenge() {
  const a = Math.floor(Math.random() * 8) + 1;
  const b = Math.floor(Math.random() * 8) + 1;
  return { a, b, expected: a + b };
}

const initialChallenge = { a: 1, b: 1, expected: 2 };

const initialState: ContactFormState = {
  name: "",
  email: "",
  phone: "",
  message: "",
  captchaAnswer: ""
};

export function ContactSection() {
  const [form, setForm] = useState<ContactFormState>(initialState);
  const [challenge, setChallenge] = useState(initialChallenge);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");
  const [contactInfo, setContactInfo] = useState<ContactSettings>({
    email: siteConfig.contact.email,
    phone: siteConfig.contact.phone,
    address: siteConfig.contact.address
  });

  useEffect(() => {
    let mounted = true;

    const loadContactSettings = async () => {
      try {
        const response = await fetch("/api/contact-settings", {
          cache: "no-store"
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { settings?: ContactSettings };
        if (mounted && payload.settings) {
          setContactInfo(payload.settings);
        }
      } catch {
        // Keep static fallback from site config.
      }
    };

    loadContactSettings();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setChallenge(getCaptchaChallenge());
  }, []);

  const canSubmit = useMemo(
    () =>
      form.name.trim().length >= 2 &&
      form.email.includes("@") &&
      form.phone.trim().length >= 8 &&
      form.message.trim().length >= 10 &&
      form.captchaAnswer.trim().length > 0,
    [form]
  );

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          captchaAnswer: Number(form.captchaAnswer),
          captchaExpected: challenge.expected
        })
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Submission failed.");
      }

      setStatus("success");
      setMessage(payload.message ?? "Message sent successfully.");
      setForm(initialState);
      setChallenge(getCaptchaChallenge());
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit right now. Please try again."
      );
      setChallenge(getCaptchaChallenge());
    }
  };

  return (
    <section id="contact" className="section-shell section-spacing">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionHeading title="Contact" subtitle="Lets Connect With You" />
          <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Reach out for admissions, transport details, fee structure, or campus
            visits. Our team will respond shortly.
          </p>

          <div className="mt-6 space-y-3">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-100">
                <Mail className="h-4 w-4 text-brand-600" /> {contactInfo.email}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-100">
                <Phone className="h-4 w-4 text-brand-600" /> {contactInfo.phone}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-100">
                <MapPin className="h-4 w-4 text-brand-600" /> {contactInfo.address}
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <label htmlFor="contact-name" className="text-sm font-medium">
                Name
              </label>
              <input
                id="contact-name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                required
                minLength={2}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none ring-brand-300 focus:ring dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
            <div className="sm:col-span-1">
              <label htmlFor="contact-email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                required
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none ring-brand-300 focus:ring dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="contact-phone" className="text-sm font-medium">
                Phone
              </label>
              <input
                id="contact-phone"
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({ ...current, phone: event.target.value }))
                }
                required
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none ring-brand-300 focus:ring dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="contact-message" className="text-sm font-medium">
                Message
              </label>
              <textarea
                id="contact-message"
                rows={5}
                value={form.message}
                onChange={(event) =>
                  setForm((current) => ({ ...current, message: event.target.value }))
                }
                required
                minLength={10}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-brand-300 focus:ring dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="contact-captcha" className="text-sm font-medium">
                CAPTCHA: {challenge.a} + {challenge.b} = ?
              </label>
              <input
                id="contact-captcha"
                value={form.captchaAnswer}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    captchaAnswer: event.target.value
                  }))
                }
                required
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none ring-brand-300 focus:ring dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit || status === "loading"}
            className="mt-5 w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === "loading" ? "Sending..." : "Send Message"}
          </button>

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
        </form>
      </div>
    </section>
  );
}
