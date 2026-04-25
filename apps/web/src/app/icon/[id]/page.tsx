import { Suspense } from "react";
import { getAllIcons, getIconById } from "@/lib/icons";
import { notFound } from "next/navigation";
import { IconDetail } from "@/components/IconDetail";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DotField } from "@/components/DotField";

const ICON_BACKGROUND =
  "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 1512 982' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%25' width='100%25' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(-0.0000090122 -58.004 109.09 -0.00001695 756 982)'><stop stop-color='rgba(123,100,254,0.05)' offset='0'/><stop stop-color='rgba(13,15,18,0)' offset='1'/></radialGradient></defs></svg>\"), url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 1512 982' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%25' width='100%25' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(0.0000090122 49.1 -120.87 0.000022186 756 0.0000075669)'><stop stop-color='rgba(255,255,255,0.05)' offset='0'/><stop stop-color='rgba(13,15,18,0)' offset='1'/></radialGradient></defs></svg>\"), linear-gradient(90deg, rgb(13, 15, 18) 0%, rgb(13, 15, 18) 100%)";

export default async function IconPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const icon = getIconById(id);
  if (!icon) return notFound();
  const allIcons = getAllIcons();

  return (
    <div
      className="relative flex h-dvh flex-col overflow-hidden"
      style={{
        backgroundColor: "#0d0f12",
        backgroundImage: ICON_BACKGROUND,
        backgroundRepeat: "no-repeat, no-repeat, no-repeat",
        backgroundSize: "100% 100%, 100% 100%, 100% 100%",
        backgroundPosition: "center center, center center, center center",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
      >
        <DotField />
      </div>
      <div className="relative">
        <Header variant="dashboard" showInlineSearch={false} />
      </div>
      <div className="relative flex-1 min-h-0 overflow-x-hidden overflow-y-auto">
        <Suspense>
          <IconDetail icon={icon} relatedIcons={allIcons} />
        </Suspense>
      </div>
      <div className="relative">
        <Footer variant="dashboard" />
      </div>
    </div>
  );
}
