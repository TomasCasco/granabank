import type { Metadata } from "next";
import { HomeView } from "@/components/home-view";

export const metadata: Metadata = { title: "Inicio · v2" };

export default function V2HomePage() {
  return <HomeView />;
}
