export type SignupPreferences = {
  alerts: boolean;
  promos: boolean;
  fakePromos: boolean;
};

export type SignupData = {
  fullName: string;
  email: string;
  phone: string;
  preferences: SignupPreferences;
  website?: string;
};

export type SignupField = "fullName" | "email" | "phone";
export type SignupErrors = Partial<Record<SignupField, string>>;

const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[+\d][\d\s().-]{6,31}$/;

function text(value: unknown): string {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function hasUnsafeText(value: string): boolean {
  return CONTROL_CHARS.test(value) || /[<>]/.test(value);
}

export function normalizeSignupInput(input: unknown):
  | { ok: true; data: SignupData }
  | { ok: false; errors: SignupErrors; honeypot?: boolean } {
  const raw = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const fullName = text(raw.fullName);
  const email = text(raw.email).toLowerCase();
  const phone = text(raw.phone);
  const website = text(raw.website);
  const preferences = raw.preferences && typeof raw.preferences === "object"
    ? (raw.preferences as Record<string, unknown>)
    : {};

  if (website) {
    return { ok: false, errors: {}, honeypot: true };
  }

  const errors: SignupErrors = {};

  if (fullName.length < 3 || fullName.length > 80 || hasUnsafeText(fullName)) {
    errors.fullName = "Entrez un nom complet valide.";
  }

  if (email.length > 254 || !EMAIL.test(email) || hasUnsafeText(email)) {
    errors.email = "Adresse email invalide.";
  }

  if (phone.length > 32 || !PHONE.test(phone) || hasUnsafeText(phone)) {
    errors.phone = "Numéro de téléphone invalide.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      fullName,
      email,
      phone,
      website: "",
      preferences: {
        alerts: preferences.alerts === true,
        promos: preferences.promos === true,
        fakePromos: preferences.fakePromos === true,
      },
    },
  };
}
