"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  AlertTriangle,
  BellRing,
  Check,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  Siren,
  Tag,
  User,
  type LucideIcon,
} from "lucide-react";
import { normalizeSignupInput, type SignupErrors } from "@/lib/signupValidation";

/* ------------------------------------------------------------------ */
/*  Types & data                                                       */
/* ------------------------------------------------------------------ */

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  website: string;
};

type PrefKey = "alerts" | "promos" | "fakePromos";

const PREFERENCES: {
  key: PrefKey;
  label: string;
  icon: LucideIcon;
  accent: string;
}[] = [
  { key: "alerts", label: "Recevoir les alertes prix", icon: BellRing, accent: "text-gold-400" },
  { key: "promos", label: "Recevoir les meilleures promotions", icon: Tag, accent: "text-emerald-400" },
  {
    key: "fakePromos",
    label: "Être averti des fausses promotions",
    icon: AlertTriangle,
    accent: "text-siren",
  },
];

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    // wait for the background image + glass card to appear first
    transition: { staggerChildren: 0.07, delayChildren: 1.45 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
};

const FORM_REVEAL_DELAY_MS = 1450;

/* ------------------------------------------------------------------ */
/*  Field component                                                    */
/* ------------------------------------------------------------------ */

function Field({
  id,
  label,
  type = "text",
  icon: Icon,
  value,
  onChange,
  error,
  autoComplete,
  inputMode,
  maxLength,
  minLength,
  pattern,
  required = true,
}: {
  id: "fullName" | "email" | "phone";
  label: string;
  type?: string;
  icon: LucideIcon;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel";
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <motion.div variants={item} className="relative signup-form-field">
      <div
        className={`group relative flex items-center rounded-xl border bg-navy-900/50 transition-all duration-300
          ${
            error
              ? "border-siren/70 shadow-[0_0_0_3px_rgba(255,45,45,0.15)]"
              : focused
                ? "border-gold-500/80 shadow-[0_0_0_3px_rgba(245,184,0,0.18)]"
                : "border-white/10 hover:border-white/20"
          }`}
      >
        <span
          className={`pl-3.5 transition-colors duration-300 ${
            error ? "text-siren" : focused ? "text-gold-400" : "text-slate-400"
          }`}
        >
          <Icon size={19} strokeWidth={2} />
        </span>

        <div className="relative flex-1">
          <input
            id={id}
            name={id}
            type={type}
            value={value}
            inputMode={inputMode}
            autoComplete={autoComplete}
            required={required}
            minLength={minLength}
            maxLength={maxLength}
            pattern={pattern}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => onChange(e.target.value)}
            className="peer w-full bg-transparent px-3 pb-2 pt-5 text-[15px] text-white outline-none placeholder:text-transparent"
            placeholder={label}
          />
          <label
            htmlFor={id}
            className={`pointer-events-none absolute left-3 origin-left transition-all duration-200
              ${
                active
                  ? "top-1.5 text-[11px] font-medium tracking-wide"
                  : "top-1/2 -translate-y-1/2 text-[15px]"
              }
              ${error ? "text-siren/80" : focused ? "text-gold-400" : "text-slate-400"}`}
          >
            {label}
          </label>
        </div>

      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 6 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="flex items-center gap-1 pl-1 text-xs text-siren"
          >
            <AlertTriangle size={13} /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Toggle component                                                   */
/* ------------------------------------------------------------------ */

function Toggle({
  checked,
  onChange,
  label,
  icon: Icon,
  accent,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  icon: LucideIcon;
  accent: string;
}) {
  return (
    <motion.button
      type="button"
      variants={item}
      onClick={onChange}
      whileTap={{ scale: 0.98 }}
      aria-pressed={checked}
      className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all duration-300 signup-form-toggle
        ${
          checked
            ? "border-gold-500/40 bg-gold-500/10"
            : "border-white/10 bg-navy-900/40 hover:border-white/20"
        }`}
    >
      <span className={`shrink-0 ${checked ? accent : "text-slate-500"} transition-colors`}>
        <Icon size={18} strokeWidth={2.2} />
      </span>
      <span
        className={`flex-1 text-sm leading-tight transition-colors ${
          checked ? "text-white" : "text-slate-400"
        }`}
      >
        {label}
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${
          checked ? "bg-gold-500" : "bg-navy-700"
        }`}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`absolute top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        >
          {checked && <Check size={12} className="text-gold-600" strokeWidth={3.5} />}
        </motion.span>
      </span>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main form                                                          */
/* ------------------------------------------------------------------ */

export default function SignupForm() {
  const [isReady, setIsReady] = useState(false);
  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    phone: "",
    website: "",
  });
  const [errors, setErrors] = useState<SignupErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>({
    alerts: true, // picked by default
    promos: true, // picked by default
    fakePromos: true, // picked by default
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  useEffect(() => {
    const timer = window.setTimeout(() => setIsReady(true), FORM_REVEAL_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const update = (key: keyof FormState, v: string) => {
    setForm((f) => ({ ...f, [key]: v }));
    if (key !== "website" && errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
    if (submitError) setSubmitError("");
  };

  const payload = () => ({
    fullName: form.fullName,
    email: form.email,
    phone: form.phone,
    website: form.website,
    preferences: prefs,
  });

  const validate = () => {
    const parsed = normalizeSignupInput(payload());
    if (!parsed.ok) {
      setErrors(parsed.errors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (status !== "idle") return;
    if (!validate()) return;

    setStatus("loading");

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload()),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (result?.errors && typeof result.errors === "object") {
          setErrors(result.errors as SignupErrors);
        }

        setSubmitError(
          typeof result?.message === "string"
            ? result.message
            : "Impossible de finaliser l'inscription pour le moment.",
        );
        setStatus("idle");
        return;
      }

      setStatus("success");
    } catch {
      setSubmitError("Connexion impossible. Réessayez dans quelques instants.");
      setStatus("idle");
    }
  };

  if (!isReady) return null;

  return (
    <motion.div
      // The card mounts after the delay, already using the final glass blur.
      initial={{ y: 18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full"
    >
      {/* soft spotlight that seats the form over the busy poster:
          darkens just around the card so the rest of the poster stays bright */}
      <div
        className="pointer-events-none absolute -inset-x-8 -inset-y-14"
        style={{
          background:
            "radial-gradient(closest-side, rgba(6,11,28,0.72), rgba(6,11,28,0.38) 62%, rgba(6,11,28,0) 100%)",
        }}
        aria-hidden
      />

      {/* subtle liquid-glass edge glow without an extra blur layer */}
      <div
        className="absolute -inset-px rounded-[26px] bg-gradient-to-br from-gold-400/35 via-white/10 to-siren/25 opacity-70"
        aria-hidden
      />

      <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/[0.14] to-white/[0.04] p-5 shadow-2xl shadow-black/50 ring-1 ring-inset ring-white/10 backdrop-blur-2xl backdrop-saturate-150 sm:p-6 signup-form-card">
        {/* specular sheen across the top of the glass */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/15 to-transparent"
          aria-hidden
        />
        {/* top shimmer line */}
        <div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent"
          aria-hidden
        />

        <AnimatePresence mode="wait">
          {status === "success" ? (
            <SuccessView key="success" name={form.fullName} />
          ) : (
            <motion.div key="form" variants={container} initial="hidden" animate="show" exit={{ opacity: 0 }}>
              {/* Compact header (the poster already carries the big branding) */}
              <motion.div variants={item} className="mb-4 text-center signup-form-header">
                <span className="relative mb-2 inline-flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold-300">
                  <span className="absolute -left-0.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-siren animate-pulse-ring" aria-hidden />
                  <Siren size={13} strokeWidth={2.6} /> Pré-inscription
                </span>
                <h1 className="text-xl font-extrabold tracking-tight text-white">
                  Rejoignez <span className="text-gold-400">1111.TN</span>
                </h1>
                <p className="mt-0.5 hidden text-xs text-slate-300/80 sm:block">
                  La police des prix — soyez parmi les premiers.
                </p>
              </motion.div>

              <form onSubmit={handleSubmit} noValidate className="space-y-3 signup-form-fields">
                <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={(e) => update("website", e.target.value)}
                  autoComplete="off"
                  tabIndex={-1}
                  className="hidden"
                  aria-hidden
                />
                <Field
                  id="fullName"
                  label="Nom complet"
                  icon={User}
                  value={form.fullName}
                  onChange={(v) => update("fullName", v)}
                  error={errors.fullName}
                  autoComplete="name"
                  minLength={3}
                  maxLength={80}
                />
                <Field
                  id="email"
                  label="Email"
                  type="email"
                  icon={Mail}
                  inputMode="email"
                  value={form.email}
                  onChange={(v) => update("email", v)}
                  error={errors.email}
                  autoComplete="email"
                  maxLength={254}
                />
                <Field
                  id="phone"
                  label="Téléphone"
                  type="tel"
                  icon={Phone}
                  inputMode="tel"
                  value={form.phone}
                  onChange={(v) => update("phone", v)}
                  error={errors.phone}
                  autoComplete="tel"
                  minLength={7}
                  maxLength={32}
                  pattern="[+\d][\d\s().-]{6,31}"
                />

                {/* Preferences */}
                <motion.div variants={item} className="space-y-2 pt-1">
                  <p className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Mes préférences
                  </p>
                  {PREFERENCES.map((p) => (
                    <Toggle
                      key={p.key}
                      checked={prefs[p.key]}
                      onChange={() => setPrefs((s) => ({ ...s, [p.key]: !s[p.key] }))}
                      label={p.label}
                      icon={p.icon}
                      accent={p.accent}
                    />
                  ))}
                </motion.div>

                <AnimatePresence>
                  {submitError && (
                    <motion.p
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 6 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="rounded-xl border border-siren/40 bg-siren/10 px-3 py-2 text-xs text-red-100"
                      role="alert"
                    >
                      {submitError}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button
                  variants={item}
                  type="submit"
                  disabled={status === "loading"}
                  whileHover={{ scale: status === "loading" ? 1 : 1.02 }}
                  whileTap={{ scale: status === "loading" ? 1 : 0.98 }}
                  className="group relative mt-1 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 px-4 py-3 text-[15px] font-bold text-navy-950 shadow-lg shadow-gold-500/25 transition-shadow hover:shadow-gold-500/40 disabled:cursor-not-allowed disabled:opacity-90 signup-form-submit"
                >
                  {/* shimmer sweep */}
                  <span
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                    aria-hidden
                  />
                  {status === "loading" ? (
                    <>
                      <Loader2 size={19} className="animate-spin" /> Inscription en cours…
                    </>
                  ) : (
                    <>Confirmer ma pré-inscription</>
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Success view                                                       */
/* ------------------------------------------------------------------ */

function SuccessView({ name }: { name: string }) {
  const first = name.trim().split(" ")[0] || "";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center py-14 text-center signup-form-success"
    >
      <motion.span
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
        className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/40"
      >
        <CheckCircle2 size={48} className="text-emerald-400" strokeWidth={2} />
      </motion.span>
      <h2 className="text-3xl font-extrabold text-white">
        Pré-inscription confirmée{first ? `, ${first}` : ""} !
      </h2>
    </motion.div>
  );
}
