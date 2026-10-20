import { z } from "zod";

// Shared by the login form and POST /api/auth/login so both enforce the same rules.
export const loginSchema = z.object({
  email: z.string().trim().min(1, "Ingresá tu email").pipe(z.email("Ingresá un email válido")),
  password: z.string().min(1, "Ingresá tu contraseña").max(200, "La contraseña es demasiado larga"),
  remember: z.boolean().default(false),
});

export type LoginInput = z.input<typeof loginSchema>;
