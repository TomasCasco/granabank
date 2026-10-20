import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = { title: "Ingresar · v2" };

export default function V2LoginPage() {
  return <LoginForm />;
}
