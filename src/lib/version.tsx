"use client";

import { createContext, useContext, type ReactNode } from "react";

/** "v1" is the Figma-faithful app at "/", "v2" applies the README's design suggestions under "/v2". */
export type Version = "v1" | "v2";

const VersionContext = createContext<Version>("v1");

export function VersionProvider({ version, children }: { version: Version; children: ReactNode }) {
  return <VersionContext value={version}>{children}</VersionContext>;
}

export function useVersion() {
  const version = useContext(VersionContext);
  const base = version === "v2" ? "/v2" : "";
  return {
    version,
    isV2: version === "v2",
    /** Prefixes an app path with the current version: to("/movimientos") → "/v2/movimientos". */
    to: (path: string) => (path === "/" ? base || "/" : base + path),
  };
}
