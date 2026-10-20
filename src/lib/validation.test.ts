import { describe, expect, it } from "vitest";
import { loginSchema } from "./validation";

const firstError = (input: unknown) => {
  const result = loginSchema.safeParse(input);
  return result.success ? null : result.error.issues[0].message;
};

describe("loginSchema", () => {
  it("accepts valid credentials and defaults remember to false", () => {
    const result = loginSchema.parse({ email: " soygranate@clublanus.com ", password: "GRANATE1@" });
    expect(result).toEqual({ email: "soygranate@clublanus.com", password: "GRANATE1@", remember: false });
  });

  it("asks for the email when it's empty", () => {
    expect(firstError({ email: "  ", password: "x" })).toBe("Ingresá tu email");
  });

  it("rejects a malformed email", () => {
    expect(firstError({ email: "soygranate", password: "x" })).toBe("Ingresá un email válido");
  });

  it("asks for the password when it's empty", () => {
    expect(firstError({ email: "a@b.com", password: "" })).toBe("Ingresá tu contraseña");
  });

  it("rejects non-object bodies", () => {
    expect(loginSchema.safeParse(null).success).toBe(false);
  });
});
