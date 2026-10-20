import { BottomNav } from "@/components/bottom-nav";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {/* Bottom padding keeps the last item clear of the fixed nav bar. */}
      <main className="flex flex-1 flex-col px-6 pt-[26px] pb-[118px]">{children}</main>
      <BottomNav />
    </>
  );
}
