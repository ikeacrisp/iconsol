import * as React from "react";
import { getAllIcons } from "@/lib/icons";
import { CATEGORIES } from "@/lib/icon-data";
import { IconGrid } from "@/components/IconGrid";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DotField } from "@/components/DotField";

const LANDING_BACKGROUND =
  "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 1512 982' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%25' width='100%25' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(-0.0000090122 -58.004 109.09 -0.00001695 756 982)'><stop stop-color='rgba(123,100,254,0.05)' offset='0'/><stop stop-color='rgba(13,15,18,0)' offset='1'/></radialGradient></defs></svg>\"), url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 1512 982' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%25' width='100%25' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(0.0000090122 49.1 -120.87 0.000022186 756 0.0000075669)'><stop stop-color='rgba(255,255,255,0.05)' offset='0'/><stop stop-color='rgba(13,15,18,0)' offset='1'/></radialGradient></defs></svg>\"), linear-gradient(90deg, rgb(13, 15, 18) 0%, rgb(13, 15, 18) 100%)";
const DASHBOARD_FOOTER_HEIGHT = 73;
const FOOTER_MASK_IMAGE =
  "linear-gradient(to top, rgba(0,0,0,1) 0px, rgba(0,0,0,1) 24px, rgba(0,0,0,0.96) 38px, rgba(0,0,0,0.76) 52px, rgba(0,0,0,0.32) 64px, rgba(0,0,0,0) 84px)";

export default function Dashboard() {
  const icons = getAllIcons();

  return (
    <div
      className="flex flex-col"
      style={{
        height: "100dvh",
        backgroundColor: "#0d0f12",
        backgroundImage: LANDING_BACKGROUND,
        backgroundRepeat: "no-repeat, no-repeat, no-repeat",
        backgroundSize: "100% 100%, 100% 100%, 100% 100%",
        backgroundPosition: "center center, center center, center center",
        position: "relative",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      >
        <DotField />
      </div>

      <div style={{ flexShrink: 0, position: "relative", zIndex: 10 }}>
        <Header variant="dashboard" />
      </div>

      <div
        className="flex flex-1 min-h-0"
        style={{ position: "relative" }}
      >
        <React.Suspense fallback={null}>
          <IconGrid icons={icons} categories={CATEGORIES} />
        </React.Suspense>
      </div>

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 5,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#0d0f12",
            backgroundImage: LANDING_BACKGROUND,
            backgroundRepeat: "no-repeat, no-repeat, no-repeat",
            backgroundSize: "100% 100%, 100% 100%, 100% 100%",
            backgroundPosition: "center center, center center, center center",
            maskImage: FOOTER_MASK_IMAGE,
            WebkitMaskImage: FOOTER_MASK_IMAGE,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: DASHBOARD_FOOTER_HEIGHT,
          }}
        >
          {[
            { blur: 1, height: "100%" },
            { blur: 2, height: "88%" },
            { blur: 3, height: "76%" },
            { blur: 4, height: "64%" },
            { blur: 5, height: "52%" },
            { blur: 6, height: "40%" },
            { blur: 8, height: "28%" },
            { blur: 10, height: "18%" },
          ].map(({ blur, height }, index) => (
            <div
              key={index}
              className="absolute inset-x-0 bottom-0"
              style={{
                height,
                backdropFilter: `blur(${blur}px)`,
                WebkitBackdropFilter: `blur(${blur}px)`,
                maskImage: FOOTER_MASK_IMAGE,
                WebkitMaskImage: FOOTER_MASK_IMAGE,
              }}
            />
          ))}
        </div>
        {/* Restore dot-field visibility over the masked footer region */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
          }}
        >
          <DotField maskImage={FOOTER_MASK_IMAGE} />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 30,
        }}
      >
        <Footer variant="dashboard" />
      </div>
    </div>
  );
}
