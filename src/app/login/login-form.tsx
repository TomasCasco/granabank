"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { apiFetch } from "@/lib/fetcher";
import { safeNextPath } from "@/lib/redirect";
import { loginSchema } from "@/lib/validation";

type FieldErrors = Partial<Record<"email" | "password", string>>;

const inputClass =
  "h-[54px] w-full rounded-[12px] bg-white px-4 text-sm text-ink shadow-soft outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-granate/40 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-danger/50";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const parsed = loginSchema.safeParse({ email, password, remember });
    if (!parsed.success) {
      const errors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        errors[field] ??= issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setSubmitting(true);
    try {
      await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      // Read at submit time (not via useSearchParams) so the form stays in the prerendered HTML.
      router.replace(safeNextPath(new URLSearchParams(window.location.search).get("next")));
      router.refresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Algo salió mal. Probá de nuevo.");
      setSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col px-6 pt-[86px] pb-9">
      <header className="flex flex-col items-center gap-3 text-center">
        <span aria-hidden className="size-[49px] rounded-[12px] bg-granate" />
        <h1 className="text-[40px] leading-[60px] font-medium tracking-[-1.56px] text-granate">GranaBank</h1>
        <p className="text-base text-slate">Con cada compra, sumás orgullo granate</p>
      </header>

      <form noValidate onSubmit={handleSubmit} className="mt-[78px] flex flex-1 flex-col">
        <div className="flex flex-col gap-[16px]">
          <Field label="Email" id="email" error={fieldErrors.email}>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Ingresa tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              className={inputClass}
            />
          </Field>

          <Field label="Contraseña" id="password" error={fieldErrors.password}>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
                className={`${inputClass} pr-20`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-pressed={showPassword}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-slate hover:text-ink focus-visible:outline-2 focus-visible:outline-granate"
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </Field>
        </div>

        <label className="mt-4 flex w-fit cursor-pointer items-center gap-2 text-sm leading-5 font-medium text-muted">
          <span className="relative grid size-[18px] place-items-center">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="peer size-[18px] cursor-pointer appearance-none rounded-[5px] bg-[#dbdbdb] transition checked:bg-granate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-granate"
            />
            <svg
              viewBox="0 0 12 12"
              aria-hidden
              className="pointer-events-none absolute size-3 fill-none stroke-white stroke-2 opacity-0 peer-checked:opacity-100"
            >
              <path d="M2.5 6.5l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          Recordarme
        </label>

        {formError && (
          <p role="alert" className="mt-6 rounded-[12px] bg-danger-soft px-4 py-3 text-sm text-danger">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-auto h-[60px] w-full rounded-[16px] bg-granate text-base leading-[22px] font-semibold text-white shadow-soft transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-granate disabled:cursor-wait disabled:opacity-70"
        >
          {submitting ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </main>
  );
}

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <label htmlFor={id} className="text-base leading-[22px] font-medium text-ink">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="-mt-2 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
