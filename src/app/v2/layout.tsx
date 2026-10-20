import { VersionProvider } from "@/lib/version";

// v2 applies the README's design suggestions on top of the same app. The `v2` class
// swaps design tokens (e.g. a higher-contrast gray) without touching any component.
export default function V2Layout({ children }: LayoutProps<"/v2">) {
  return (
    <VersionProvider version="v2">
      <div className="v2 contents">{children}</div>
    </VersionProvider>
  );
}
