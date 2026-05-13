/**
 * Shared OG card layout used by both the root `opengraph-image.tsx` and
 * the per-icon `icon/[id]/opengraph-image.tsx`. Mirrors the Figma design
 * (node 656:238): a 1200x630 dark card with a Fraunces serif headline,
 * an icon tile holding the SOLID (white) brand mark, the brand name in
 * Geist, a Copy code / SVG / PNG affordance, and the iconsol wordmark
 * pinned to the bottom-right.
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Icon } from "@/lib/icon-data";

const HEADLINE = "A crisp set of Solana Ecosystem logos";

const TILE_BG = "linear-gradient(to bottom, #17181b, #101215)";
const TILE_BORDER = "0.792px solid #1f2124";
const TILE_RING_SHADOW = "0px 0px 0px 1.584px #0d0f12";

// Project page bg with the same subtle purple/cyan radial accents used in
// the home + lens compositions. Satori parses `background` strictly, so the
// solid colour is applied via backgroundColor and the gradients via
// backgroundImage (it rejects a hex value inside a `background:` shorthand).
const PAGE_BG_COLOR = "#0a0b0f";
const PAGE_BG_IMAGE =
  "radial-gradient(70% 60% at 30% 100%, rgba(134,98,255,0.20) 0%, rgba(13,15,18,0) 60%), " +
  "radial-gradient(70% 60% at 70% 100%, rgba(91,227,255,0.14) 0%, rgba(13,15,18,0) 60%)";

async function loadSolidLogoDataUrl(id: string): Promise<string | null> {
  // Solid logos are white-on-transparent SVGs at public/solid/<id>.svg.
  // Try the local filesystem first (fast path during static build), and
  // fall back to an HTTP fetch of the public asset for request-time
  // serverless functions where fs.readFile doesn't always reach /public.
  // Either way, strip CSS var(--…) fallbacks before encoding — Satori's
  // <img> SVG renderer doesn't resolve them.
  const sanitise = (svg: string) =>
    svg.replace(/var\(\s*--[^,)]+,\s*([^)]+?)\s*\)/g, "$1");

  try {
    const buffer = await readFile(
      join(process.cwd(), "public", "solid", `${id}.svg`),
    );
    const text = sanitise(buffer.toString("utf8"));
    return `data:image/svg+xml;base64,${Buffer.from(text, "utf8").toString("base64")}`;
  } catch {
    // Fall through to HTTP fetch.
  }

  try {
    const host = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://iconsol.me";
    const res = await fetch(`${host}/solid/${id}.svg`);
    if (!res.ok) return null;
    const text = sanitise(await res.text());
    return `data:image/svg+xml;base64,${Buffer.from(text, "utf8").toString("base64")}`;
  } catch {
    return null;
  }
}

function IconsolWordmark({ width = 186.1 }: { width?: number }) {
  // Inline the iconsol wordmark so it renders identically regardless of
  // Satori's <img>/SVG quirks. Original viewBox is 88.6181 x 19.9186.
  const height = width * (19.9186 / 88.6181);
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 88.6181 19.9186"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.6949 0C18.1538 0 23.3898 4.45894 23.3898 9.95928C23.3898 15.4596 18.1538 19.9186 11.6949 19.9186C5.23599 19.9186 0 15.4596 0 9.95928C0 4.45894 5.23599 3.46039e-06 11.6949 0ZM11.6949 7.44606C8.67158 7.44607 6.22071 10.0362 6.2207 13.2313C6.2207 16.4264 8.67158 19.0166 11.6949 19.0166C14.7182 19.0166 17.1691 16.4264 17.1691 13.2313C17.1691 10.0362 14.7182 7.44606 11.6949 7.44606ZM11.6949 0.871984C8.67159 0.871988 6.22072 2.04868 6.2207 3.50021C6.2207 4.95174 8.67158 6.12849 11.6949 6.12849C14.7182 6.12849 17.1691 4.95174 17.1691 3.50021C17.1691 2.04868 14.7182 0.871984 11.6949 0.871984Z"
        fill="white"
      />
      <path d="M30.3898 3.24623H32.7504V5.60686H30.3898V3.24623ZM30.3898 6.78718H32.7504V16.5248H30.3898V6.78718Z" fill="white" />
      <path d="M33.942 11.656C33.942 10.697 34.1387 9.83633 34.5321 9.07404C34.9379 8.31175 35.5157 7.71545 36.2657 7.28512C37.0157 6.8548 37.8825 6.63964 38.8661 6.63964C39.739 6.63964 40.5075 6.81792 41.1714 7.17447C41.8353 7.53102 42.3517 8.00438 42.7206 8.59454C43.1017 9.1724 43.323 9.79945 43.3845 10.4757H41.0608C40.987 9.98387 40.7595 9.57814 40.3784 9.25847C39.9972 8.9388 39.4931 8.77896 38.8661 8.77896C38.0669 8.77896 37.4399 9.04331 36.985 9.57199C36.5301 10.1007 36.3026 10.7953 36.3026 11.656C36.3026 12.5166 36.5301 13.2113 36.985 13.74C37.4399 14.2687 38.0669 14.533 38.8661 14.533C39.4931 14.533 39.9972 14.3732 40.3784 14.0535C40.7595 13.7338 40.987 13.3281 41.0608 12.8363H43.3845C43.323 13.5125 43.1017 14.1457 42.7206 14.7359C42.3517 15.3137 41.8353 15.7809 41.1714 16.1375C40.5198 16.4941 39.7513 16.6723 38.8661 16.6723C37.8948 16.6723 37.0342 16.4572 36.2842 16.0268C35.5465 15.5965 34.9686 15.0002 34.5506 14.2379C34.1448 13.4756 33.942 12.615 33.942 11.656Z" fill="white" />
      <path d="M49.2027 6.63964C50.1863 6.63964 51.0469 6.86095 51.7846 7.30357C52.5223 7.74619 53.0879 8.34864 53.4813 9.11093C53.8748 9.87322 54.0715 10.7216 54.0715 11.656C54.0715 12.5904 53.8748 13.4388 53.4813 14.201C53.0879 14.9633 52.5223 15.5658 51.7846 16.0084C51.0469 16.451 50.1863 16.6723 49.2027 16.6723C48.2191 16.6723 47.3584 16.451 46.6207 16.0084C45.883 15.5658 45.3175 14.9633 44.924 14.201C44.5306 13.4388 44.3339 12.5904 44.3339 11.656C44.3339 10.7216 44.5306 9.87322 44.924 9.11093C45.3175 8.34864 45.883 7.74619 46.6207 7.30357C47.3584 6.86095 48.2191 6.63964 49.2027 6.63964ZM49.2027 14.533C49.9773 14.533 50.5859 14.2625 51.0285 13.7215C51.4834 13.1683 51.7108 12.4798 51.7108 11.656C51.7108 10.8322 51.4834 10.1499 51.0285 9.60887C50.5859 9.0556 49.9773 8.77896 49.2027 8.77896C48.4281 8.77896 47.8133 9.0556 47.3584 9.60887C46.9158 10.1499 46.6945 10.8322 46.6945 11.656C46.6945 12.4798 46.9158 13.1683 47.3584 13.7215C47.8133 14.2625 48.4281 14.533 49.2027 14.533Z" fill="white" />
      <path d="M60.9053 6.63964C61.9872 6.63964 62.8417 6.99005 63.4688 7.69086C64.0958 8.39167 64.4093 9.4183 64.4093 10.7707V16.5248H62.0487V11.5822C62.0487 10.5248 61.9073 9.7933 61.6245 9.38756C61.3417 8.98183 60.8807 8.77896 60.2413 8.77896C59.7864 8.77896 59.3561 8.9388 58.9504 9.25847C58.5569 9.57814 58.2373 10.0269 57.9914 10.6048C57.7455 11.1826 57.6225 11.8343 57.6225 12.5597V16.5248H55.2619V6.78718H57.6225V7.39578C57.6225 7.67856 57.5979 7.91832 57.5487 8.11504C57.4996 8.31175 57.4258 8.51462 57.3274 8.72364C57.266 8.87118 57.2352 8.96954 57.2352 9.01872C57.2352 9.12937 57.2844 9.19085 57.3828 9.20314H57.4381C57.5242 9.20314 57.5979 9.12937 57.6594 8.98183C57.9299 8.37938 58.3479 7.8384 58.9135 7.35889C59.4791 6.87939 60.143 6.63964 60.9053 6.63964Z" fill="white" />
      <path d="M67.9097 13.242C67.922 13.6847 68.0879 14.0597 68.4076 14.367C68.7396 14.6744 69.2928 14.8281 70.0674 14.8281C70.7805 14.8281 71.2908 14.7236 71.5981 14.5146C71.9178 14.3056 72.0777 14.0228 72.0777 13.6662C72.0777 13.4326 71.9731 13.2543 71.7641 13.1314C71.5674 13.0084 71.2908 12.9162 70.9342 12.8547C70.5777 12.781 70.0182 12.7011 69.256 12.615C67.9281 12.4552 67.0306 12.0986 66.5634 11.5453C66.1084 10.9798 65.881 10.3343 65.881 9.60887C65.881 9.0679 66.0408 8.5761 66.3605 8.13348C66.6802 7.67856 67.1535 7.31586 67.7806 7.04537C68.4076 6.77488 69.1637 6.63964 70.049 6.63964C71.2908 6.63964 72.2682 6.93472 72.9813 7.52488C73.6944 8.10274 74.0817 8.85273 74.1432 9.77486H71.8195C71.7826 9.40601 71.6227 9.09863 71.34 8.85273C71.0695 8.60683 70.6207 8.48388 69.9937 8.48388C68.8256 8.48388 68.2416 8.81585 68.2416 9.47978C68.2416 9.6642 68.2847 9.81789 68.3707 9.94084C68.4691 10.0638 68.6719 10.1744 68.9793 10.2728C69.2867 10.3712 69.7416 10.4511 70.3441 10.5126C71.635 10.6478 72.6371 10.949 73.3502 11.4162C74.0756 11.8711 74.4383 12.5597 74.4383 13.4818C74.4383 14.5023 74.051 15.2892 73.2764 15.8424C72.5141 16.3957 71.4199 16.6723 69.9937 16.6723C68.6166 16.6723 67.547 16.3711 66.7847 15.7687C66.0347 15.1539 65.6351 14.3117 65.5859 13.242H67.9097Z" fill="white" />
      <path d="M80.1982 6.63964C81.1818 6.63964 82.0425 6.86095 82.7802 7.30357C83.5179 7.74619 84.0835 8.34864 84.4769 9.11093C84.8703 9.87322 85.067 10.7216 85.067 11.656C85.067 12.5904 84.8703 13.4388 84.4769 14.201C84.0835 14.9633 83.5179 15.5658 82.7802 16.0084C82.0425 16.451 81.1818 16.6723 80.1982 16.6723C79.2146 16.6723 78.354 16.451 77.6163 16.0084C76.8786 15.5658 76.313 14.9633 75.9196 14.201C75.5262 13.4388 75.3294 12.5904 75.3294 11.656C75.3294 10.7216 75.5262 9.87322 75.9196 9.11093C76.313 8.34864 76.8786 7.74619 77.6163 7.30357C78.354 6.86095 79.2146 6.63964 80.1982 6.63964ZM80.1982 14.533C80.9728 14.533 81.5814 14.2625 82.024 13.7215C82.479 13.1683 82.7064 12.4798 82.7064 11.656C82.7064 10.8322 82.479 10.1499 82.024 9.60887C81.5814 9.0556 80.9728 8.77896 80.1982 8.77896C79.4237 8.77896 78.8089 9.0556 78.354 9.60887C77.9114 10.1499 77.6901 10.8322 77.6901 11.656C77.6901 12.4798 77.9114 13.1683 78.354 13.7215C78.8089 14.2625 79.4237 14.533 80.1982 14.533Z" fill="white" />
      <path d="M88.6181 3.24623V16.5248H86.2575V3.24623H88.6181Z" fill="white" />
    </svg>
  );
}

function FileTag({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 38.51,
        height: 38.51,
        borderRadius: 9.628,
        background: "rgba(255,255,255,0.04)",
        color: "rgba(255,255,255,0.6)",
        fontFamily: "Geist",
        fontSize: 10.5,
        fontWeight: 500,
        letterSpacing: "0.04em",
      }}
    >
      {label}
    </div>
  );
}

export async function renderOgCard(icon: Icon | undefined) {
  const logoDataUrl = icon ? await loadSolidLogoDataUrl(icon.id) : null;
  const name = icon?.name ?? "iconsol";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        padding: 64,
        backgroundColor: PAGE_BG_COLOR,
        backgroundImage: PAGE_BG_IMAGE,
        fontFamily: "Geist",
        color: "#ffffff",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          alignItems: "flex-end",
          gap: 32,
        }}
      >
        {/* Left column: headline + (tile + name + copy buttons) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            height: 501,
            gap: 64,
          }}
        >
          {/* Headline — serif, exactly 2 lines.
              Width chosen so "A crisp set of Solana" fits on one line in
              Fraunces 56px (which has wider glyphs than the Figma source's
              Plantijn). The line break before "Ecosystem" follows naturally. */}
          <div
            style={{
              display: "flex",
              fontFamily: "Fraunces",
              fontSize: 56,
              lineHeight: 1.25,
              letterSpacing: "-0.012em",
              color: "rgba(255,255,255,0.85)",
              width: 620,
            }}
          >
            {HEADLINE}
          </div>

          {/* Icon tile + name + copy/file buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 37.234,
            }}
          >
            {/* Icon tile — 188.69 sq, rounded, gradient, hairline border + ring */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 188.69,
                height: 188.69,
                borderRadius: 47.533,
                background: TILE_BG,
                border: TILE_BORDER,
                boxShadow: TILE_RING_SHADOW,
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {logoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoDataUrl}
                  alt=""
                  width={112.141}
                  height={112.141}
                  style={{ width: 112.141, height: 112.141, display: "block" }}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    fontFamily: "Geist",
                    fontSize: 56,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.85)",
                  }}
                >
                  {name.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>

            {/* Right side: name + Copy code pill */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 19.013,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontFamily: "Geist",
                  fontWeight: 500,
                  fontSize: 50.7,
                  letterSpacing: "-0.02em",
                  color: "#ffffff",
                  lineHeight: 1,
                }}
              >
                {name}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: 57.767,
                  borderRadius: 60.174,
                }}
              >
                {/* Copy code pill */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "14.442px 18px",
                    borderRadius: 60.174,
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      fontFamily: "Geist",
                      fontSize: 14.442,
                      fontWeight: 400,
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    Copy code
                  </div>
                </div>

                {/* File-type chips */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10.831,
                    padding: "9.628px 14.442px",
                  }}
                >
                  <FileTag label="SVG" />
                  <FileTag label="PNG" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: iconsol wordmark, aligned to the row's bottom */}
        <div style={{ display: "flex", flexShrink: 0 }}>
          <IconsolWordmark width={186.1} />
        </div>
      </div>
    </div>
  );
}
