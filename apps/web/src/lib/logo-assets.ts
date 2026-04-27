import type { IconCategory } from "./icon-data";

export type LogoId =
  | "altitude"
  | "arcium"
  | "asgard"
  | "avici"
  | "backpack"
  | "bags"
  | "bonk"
  | "carrot"
  | "circle"
  | "claynosaurz"
  | "colosseum"
  | "crossmint"
  | "dflow"
  | "drip-haus"
  | "eurc"
  | "fomo"
  | "fuse"
  | "helius"
  | "helius-orb"
  | "infsol"
  | "jito"
  | "jitosol"
  | "jto"
  | "jup"
  | "jupiter-lend"
  | "jupsol"
  | "jupusd"
  | "kamino"
  | "kast"
  | "magic-eden"
  | "madlads"
  | "marginfi"
  | "marinade"
  | "metadao"
  | "metaplex"
  | "meteora"
  | "moonpay"
  | "moonshot"
  | "opos"
  | "oro"
  | "perena"
  | "phantom"
  | "powered-by-solana"
  | "pump-fun"
  | "raydium"
  | "sanctum"
  | "sanctum-gateway"
  | "scloud"
  | "seeker"
  | "sendai"
  | "sol"
  | "solflare"
  | "squads"
  | "superteam"
  | "umbra"
  | "usdc"
  | "usd-prime"
  | "usd-star"
  | "usdt"
  | "xstock"
  | "zora";

export interface IconMetaOverride {
  name: string;
  category: IconCategory;
  aliases: string[];
  tags: string[];
  website?: string;
  ticker?: string;
  description?: string;
  relatedIds?: string[];
  contributors?: import("./icon-data").Contributor[];
}

export interface LogoAssetLayer {
  src: string;
  remote: string;
  width: number;
  height: number;
  x: number;
  y: number;
  rotation?: number;
  maskSrcs?: string[];
  maskRemotes?: string[];
  maskPositions?: string;
  maskSizes?: string;
}

export interface LogoAssetSpec {
  background?: string;
  radius?: number;
  layers: LogoAssetLayer[];
}

export type LogoVariant = "brand" | "solid";

const BASE_SIZE = 32;
const BALANCED_LOGO_TARGET = 30;
const MAX_BALANCED_LOGO_SCALE = 1.24;

function centeredOrigin(width: number, height: number) {
  return {
    x: (BASE_SIZE - width) / 2,
    y: (BASE_SIZE - height) / 2,
  };
}

function brandPath(name: string) {
  return `/brand/${name}.svg`;
}

function solidPath(name: string) {
  return `/solid/${name}.svg`;
}

function designAsset(id: string) {
  const base = String.fromCharCode(
    104, 116, 116, 112, 115, 58, 47, 47, 119, 119, 119, 46, 102, 105, 103, 109,
    97, 46, 99, 111, 109, 47, 97, 112, 105, 47, 109, 99, 112, 47, 97, 115, 115,
    101, 116, 47
  );

  return `${base}${id}`;
}

// Use for layers that the design export pipeline flattens to raster (e.g. angular/conic gradients
// that can't be reconstructed as true vector). Exported so the download script
// and future spec entries can reference a raster-only layer honestly.
export function brandPng(name: string) {
  return `/brand/${name}.png`;
}

function fullAsset(
  src: string,
  remote: string,
  options: Pick<LogoAssetSpec, "background" | "radius"> = {}
): LogoAssetSpec {
  return {
    ...options,
    layers: [{ src, remote, x: 0, y: 0, width: BASE_SIZE, height: BASE_SIZE }],
  };
}

function insetAsset(
  src: string,
  remote: string,
  width: number,
  height: number,
  x: number,
  y: number,
  options: Pick<LogoAssetSpec, "background" | "radius"> = {}
): LogoAssetSpec {
  return {
    ...options,
    layers: [{ src, remote, width, height, x, y }],
  };
}

function centeredAsset(
  src: string,
  remote: string,
  width: number,
  height: number,
  options: Pick<LogoAssetSpec, "background" | "radius"> = {}
): LogoAssetSpec {
  const { x, y } = centeredOrigin(width, height);
  return insetAsset(src, remote, width, height, x, y, options);
}

function maskedCenteredAsset(
  src: string,
  remote: string,
  maskSrcs: string[],
  maskRemotes: string[],
  width: number,
  height: number,
  options: Pick<LogoAssetSpec, "background" | "radius"> & {
    maskPositions?: string;
    maskSizes?: string;
  } = {}
): LogoAssetSpec {
  const { x, y } = centeredOrigin(width, height);
  return {
    background: options.background,
    radius: options.radius,
    layers: [
      {
        src,
        remote,
        width,
        height,
        x,
        y,
        maskSrcs,
        maskRemotes,
        maskPositions: options.maskPositions,
        maskSizes: options.maskSizes,
      },
    ],
  };
}

export const LOGO_ORDER: LogoId[] = [
  "sol",
  "sanctum",
  "helius",
  "jup",
  "phantom",
  "helius-orb",
  "backpack",
  "solflare",
  "sanctum-gateway",
  "perena",
  "superteam",
  "carrot",
  "oro",
  "altitude",
  "dflow",
  "pump-fun",
  "usd-prime",
  "fuse",
  "usd-star",
  "xstock",
  "magic-eden",
  "colosseum",
  "scloud",
  "crossmint",
  "marginfi",
  "kamino",
  "infsol",
  "moonshot",
  "umbra",
  "arcium",
  "bonk",
  "kast",
  "asgard",
  "fomo",
  "jupiter-lend",
  "moonpay",
  "jto",
  "sendai",
  "eurc",
  "usdc",
  "circle",
  "bags",
  "powered-by-solana",
  "jupusd",
  "jitosol",
  "madlads",
  "opos",
  "drip-haus",
  "jupsol",
  "metadao",
  "meteora",
  "jito",
  "marinade",
  "metaplex",
  "raydium",
  "zora",
  "claynosaurz",
  "seeker",
  "avici",
  "squads",
  "usdt",
];

export const META_SOURCE_IDS: Partial<Record<LogoId, string>> = {
  jito: "jito-protocol",
  raydium: "raydium-protocol",
};

export const META_OVERRIDES: Partial<
  Record<LogoId, IconMetaOverride>
> = {
  sanctum: {
    name: "Sanctum",
    category: "defi",
    aliases: ["sanctum"],
    tags: ["liquid-staking"],
  },
  infsol: {
    name: "infSOL",
    category: "tokens",
    aliases: ["infsol", "infinite-sol"],
    tags: ["liquid-staking", "staking"],
    website: "https://sanctum.so",
    description:
      "infSOL is a basket liquid staking token from Sanctum Infinity, routing stake across many validators for diversified yield.",
    relatedIds: ["sanctum", "jitosol", "sol"],
  },
  scloud: {
    name: "sCLOUD",
    category: "tokens",
    aliases: ["scloud", "sanctum-cloud"],
    tags: ["liquid-staking", "staking"],
    website: "https://sanctum.so",
    description:
      "sCLOUD is Sanctum's liquid-staked version of CLOUD, earning staking rewards while remaining usable across Solana DeFi.",
    relatedIds: ["sanctum", "infsol", "sol"],
  },
  sendai: {
    name: "SendAI",
    category: "infrastructure",
    aliases: ["sendai"],
    tags: ["ai", "automation", "infrastructure"],
    website: "https://sendai.fun",
    description:
      "SendAI builds AI-native tooling and agent infrastructure for the Solana ecosystem.",
    relatedIds: ["superteam", "colosseum", "helius"],
  },
  circle: {
    name: "Circle",
    category: "infrastructure",
    aliases: ["circle"],
    tags: ["stablecoin", "payments", "infrastructure"],
    website: "https://www.circle.com",
    description:
      "Circle issues USDC and EURC, providing stablecoin infrastructure and payments rails across major blockchains including Solana.",
    relatedIds: ["usdc", "eurc", "sol"],
  },
  claynosaurz: {
    name: "Claynosaurz",
    category: "nft",
    aliases: ["claynosaurz"],
    tags: ["nft", "collection"],
    website: "https://claynosaurz.com",
    description:
      "Claynosaurz is a narrative-driven Solana NFT collection and animation studio building original IP onchain.",
    relatedIds: ["magic-eden", "madlads", "metaplex"],
  },
  metadao: {
    name: "MetaDAO",
    category: "infrastructure",
    aliases: ["metadao", "meta-dao"],
    tags: ["dao", "governance"],
    website: "https://metadao.fi",
    description:
      "MetaDAO is a futarchy-based governance system using onchain prediction markets to make decisions.",
    relatedIds: ["sol", "superteam", "jup"],
  },
  jito: {
    name: "Jito",
    category: "defi",
    aliases: ["jito"],
    tags: ["liquid-staking", "mev"],
  },
  raydium: {
    name: "Raydium",
    category: "defi",
    aliases: ["raydium"],
    tags: ["dex", "amm"],
  },
  marinade: {
    name: "Marinade",
    category: "defi",
    aliases: ["marinade"],
    tags: ["liquid-staking", "defi"],
  },
  usdc: {
    name: "USDC",
    category: "tokens",
    aliases: ["usdc", "usd-coin"],
    tags: ["stablecoin"],
    ticker: "USDC",
  },
  usdt: {
    name: "USDT",
    category: "tokens",
    aliases: ["usdt", "tether"],
    tags: ["stablecoin"],
    ticker: "USDT",
  },
  eurc: {
    name: "EURC",
    category: "tokens",
    aliases: ["eurc"],
    tags: ["stablecoin", "euro"],
    ticker: "EURC",
  },
  "usd-star": {
    name: "USD STAR",
    category: "tokens",
    aliases: ["usd-star", "usdstar"],
    tags: ["stablecoin"],
  },
  madlads: {
    name: "Madlads",
    category: "nft",
    aliases: ["madlads", "mad-lads"],
    tags: ["nft", "collection", "backpack"],
  },
};

export const BRAND_LOGO_ASSETS: Record<LogoId, LogoAssetSpec> = {
  sol: fullAsset(brandPath("sol"), designAsset("38361413-e3fe-4983-86a7-ec827ea720b7")),
  sanctum: fullAsset(brandPath("sanctum"), designAsset("2cc00e15-d7b8-4bd4-a897-daf3b7804585")),
  helius: fullAsset(brandPath("helius"), designAsset("0251c565-d13f-4aab-a854-bd331e857925")),
  jup: fullAsset(brandPath("jup"), designAsset("ed33bb68-2280-44eb-9593-9c0db7bc0821")),
  phantom: fullAsset(brandPath("phantom"), designAsset("ad3536ba-597b-43c4-88cd-44e60d5efc80")),
  "helius-orb": fullAsset(brandPath("helius-orb"), designAsset("73f55831-4ecc-436f-b46c-635fff8232c3")),
  backpack: insetAsset(brandPath("backpack"), designAsset("ca3599b9-cf86-4ff9-b62d-0faf8b395865"), 13.771, 19.975, 9.1145, 6.0125, {
    background: "#e33e3f",
    radius: 8,
  }),
  solflare: maskedCenteredAsset(
    brandPath("solflare-fill"),
    designAsset("24dd0913-279a-43cc-a9c9-87771c2c484e"),
    [brandPath("solflare-mask")],
    [designAsset("8e042b9b-267c-4d92-a596-2101801255ce")],
    18.791,
    19.957,
    { background: "#ffef46", radius: 8 }
  ),
  "sanctum-gateway": fullAsset(brandPath("sanctum-gateway"), designAsset("b0d928fb-9fc2-435b-b220-29bdbb93da5b")),
  perena: fullAsset(brandPath("perena"), designAsset("dc3fcaa7-e019-4b4a-98fa-77849f3dec7b")),
  superteam: fullAsset(brandPath("superteam"), designAsset("5a3d1473-c6ee-4b93-9037-5aab6e9ba272")),
  carrot: centeredAsset(brandPath("carrot"), designAsset("4dff3dfa-65a7-47dd-87c6-a933c305a5ce"), 20.002, 20.002, {
    background: "#022c22",
    radius: 8,
  }),
  oro: fullAsset(brandPath("oro"), designAsset("a39b1beb-65c7-449f-9123-0367a8a457f3")),
  altitude: fullAsset(brandPath("altitude"), designAsset("f0c7bb0f-c759-4641-be9f-19eb55ba5666")),
  dflow: fullAsset(brandPath("dflow"), designAsset("040de2d3-4a28-4d6e-befc-52928fff8ed8")),
  "pump-fun": insetAsset(brandPath("pump-fun"), designAsset("48b0c058-64fa-4b4a-8dce-b9d26a16301a"), 19.995, 20.606, 6, 5.697, {
    background: "#1a1a1a",
    radius: 8,
  }),
  "usd-prime": insetAsset(brandPath("usd-prime"), designAsset("703cd935-4007-437f-9089-d9d4ee1532e2"), 27.976, 27.976, 2.02, 2.01, {
    background: "#1a1a1a",
    radius: 8,
  }),
  fuse: centeredAsset(brandPath("fuse"), designAsset("85e113d6-e530-40a9-b7b4-47ba1881fb68"), 19.959, 19.679, {
    background: "#ffffff",
    radius: 8,
  }),
  "usd-star": insetAsset(brandPath("usd-star"), designAsset("794db47c-2a87-46c1-8e9a-3753142c0b37"), 27.987, 28.021, 2.01, 1.99, {
    background: "#1a1a1a",
    radius: 8,
  }),
  xstock: fullAsset(brandPath("xstock"), designAsset("e426b099-ba92-4afe-853c-39a00fc65653")),
  "magic-eden": fullAsset(brandPath("magic-eden"), designAsset("c971c6cf-e93f-4633-ada7-0762cadfcf79")),
  colosseum: fullAsset(brandPath("colosseum"), designAsset("33a0a334-89da-4814-972b-eb370544d409")),
  scloud: centeredAsset(brandPath("scloud"), designAsset("ebccb431-fec8-4bb9-874a-c9626d0cf2f5"), 27.992, 27.541, {
    background: "#1a1a1a",
    radius: 8,
  }),
  crossmint: fullAsset(brandPath("crossmint"), designAsset("a3840323-7cd5-46b3-abea-319e6f337bc8")),
  marginfi: fullAsset(brandPath("marginfi"), designAsset("70cc23f7-b656-4717-b65a-8d2c3631c593")),
  kamino: fullAsset(brandPath("kamino"), designAsset("5975ab99-82a8-49d7-995e-ee29d659cfba")),
  infsol: {
    background: "#1a1a1a",
    radius: 8,
    layers: [
      { src: brandPath("infsol-left"), remote: designAsset("b2807b40-2fdb-4186-aa3e-7fb5e0982f3c"), x: 5.9285, y: 10.1143, width: 11.771, height: 11.771 },
      { src: brandPath("infsol-right"), remote: designAsset("d6b2d17e-3947-41b3-87f5-d030b0a43e01"), x: 14.2515, y: 10.1143, width: 11.771, height: 11.771 },
      { src: brandPath("infsol-center"), remote: designAsset("58a689f9-2583-48fe-92a9-b9f3819902a7"), x: 13.0575, y: 13.0575, width: 5.885, height: 5.885, rotation: 45 },
    ],
  },
  moonshot: fullAsset(brandPath("moonshot"), designAsset("301a546a-68fe-4861-b757-5550383962a6")),
  umbra: fullAsset(brandPath("umbra"), designAsset("81a375f4-21eb-4fec-81e2-a6e58dc81ab5")),
  arcium: centeredAsset(brandPath("arcium"), designAsset("0923b740-48f6-4f05-8f33-40f2d56df18e"), 22.08, 15.989, {
    background: "#6d45ff",
    radius: 8,
  }),
  bonk: centeredAsset(brandPath("bonk"), designAsset("0d47a4d0-9a80-4d07-be80-b36016fc170a"), 28, 28, {
    background: "#1a1a1a",
    radius: 8,
  }),
  kast: fullAsset(brandPath("kast"), designAsset("299a02f6-ef59-4a05-a31e-4bd801842bde")),
  asgard: fullAsset(brandPath("asgard"), designAsset("b46e4cda-fbcf-47a2-bed3-3b66621f80e9")),
  fomo: fullAsset(brandPath("fomo"), designAsset("c34765b5-9df5-459e-ae90-4e81905a90c7")),
  "jupiter-lend": fullAsset(brandPath("jupiter-lend"), designAsset("0abce7a3-fc30-4a19-8b83-5c1d6f55ceab")),
  moonpay: fullAsset(brandPath("moonpay"), designAsset("fdbff4c6-ccc8-4141-bb88-ab2017cfb0a5")),
  jto: centeredAsset(brandPath("jto"), designAsset("bababd81-85cb-4785-98b7-67260e58eb6a"), 28, 28, {
    background: "#1a1a1a",
    radius: 8,
  }),
  sendai: fullAsset(brandPath("sendai"), designAsset("7bacf9b7-986a-4215-8a19-6193e123bee0")),
  eurc: centeredAsset(brandPath("eurc"), designAsset("e8aacc50-c447-405a-aaa0-9ae8d787ce52"), 28, 28, {
    background: "#1a1a1a",
    radius: 8,
  }),
  usdc: centeredAsset(brandPath("usdc"), designAsset("25a15125-57d8-40d3-a008-97ac2902518b"), 28, 28, {
    background: "#1a1a1a",
    radius: 8,
  }),
  circle: centeredAsset(brandPath("circle"), designAsset("799621e4-c648-4bee-8d79-ac0f8b47785e"), 19.997, 19.997, {
    background: "#1a1a1a",
    radius: 8,
  }),
  bags: fullAsset(brandPath("bags"), designAsset("4f871284-ae45-4528-89cc-03c99bcfc033")),
  "powered-by-solana": centeredAsset(brandPath("powered-by-solana"), designAsset("8a771621-49dc-46e0-bc87-0ab4c2b9c4aa"), 27.996, 8.735, {
    background: "#1a1a1a",
    radius: 8,
  }),
  jupusd: insetAsset(brandPath("jupusd"), designAsset("c9802de0-b0d0-48e6-bf26-52e3a03c583d"), 27.996, 27.996, 2, 2, {
    background: "#1a1a1a",
    radius: 8,
  }),
  jitosol: insetAsset(brandPath("jitosol"), designAsset("00faef51-f907-4e41-ae5b-ce63292979b6"), 28, 28, 2, 2, {
    background: "#1a1a1a",
    radius: 8,
  }),
  madlads: fullAsset(brandPath("madlads"), designAsset("02535a65-8a3e-45e2-81ae-015c70243c69")),
  opos: centeredAsset(brandPath("opos"), designAsset("3b8d55cc-1766-4929-85cc-2d0e65148066"), 27.996, 11.485, {
    background: "#1a1a1a",
    radius: 8,
  }),
  "drip-haus": fullAsset(brandPath("drip-haus"), designAsset("8fe2ed73-ee79-4b14-9657-6d0b2d235fd9")),
  jupsol: insetAsset(brandPath("jupsol"), designAsset("0fc80d16-7fdc-473f-b791-0c24aec09204"), 27.992, 27.992, 2, 2.03, {
    background: "#1a1a1a",
    radius: 8,
  }),
  metadao: fullAsset(brandPath("metadao"), designAsset("68987056-e78c-493b-9620-8ade3544f10a")),
  meteora: centeredAsset(brandPath("meteora"), designAsset("1bc949cd-e942-4f7d-9283-75a35f61d12c"), 18.454, 19.992, {
    background: "#1a1a1a",
    radius: 8,
  }),
  jito: centeredAsset(brandPath("jito"), designAsset("6a30c951-edae-4f25-a1a8-4e7800d51765"), 20.004, 8.227, {
    background: "#3a7861",
    radius: 8,
  }),
  marinade: centeredAsset(brandPath("marinade"), designAsset("1b0dff05-1baa-4aa0-b808-9138de5d1d8a"), 19.996, 13.528, {
    background: "#0b9890",
    radius: 8,
  }),
  metaplex: fullAsset(brandPath("metaplex"), designAsset("ecd6e762-9253-4406-86aa-eab0a0f71cd3")),
  raydium: fullAsset(brandPath("raydium"), designAsset("cf8cbef9-b6d3-42de-8448-3a2c4b84b006")),
  zora: fullAsset(brandPath("zora"), designAsset("58de1e06-b902-49c5-8451-04ab97a4f691")),
  claynosaurz: centeredAsset(brandPath("claynosaurz"), designAsset("e0dfb55f-70c2-4fab-9a9f-12444ffa99cd"), 19.992, 18.743, {
    background: "linear-gradient(180deg, #fc956c 0%, #ec725b 100%)",
    radius: 8,
  }),
  seeker: fullAsset(brandPath("seeker"), designAsset("d9cadc42-f68f-44c9-b67b-39a61674f9b8"), {
    background: "linear-gradient(180deg, #000000 32.982%, #125d74 61.607%, #85cbc1 90.231%)",
    radius: 8,
  }),
  avici: centeredAsset(brandPath("avici"), designAsset("2930cffa-59ac-4c8d-9172-24d1f9b0ca0b"), 19.993, 18.502, {
    background: "#ffffff",
    radius: 8,
  }),
  squads: fullAsset(brandPath("squads"), designAsset("cbe9722f-6762-4441-a485-76e781abde39")),
  usdt: fullAsset(brandPath("usdt"), designAsset("c01f99cd-42ed-4f2e-987d-5545128fbefa"), {
    background: "#1a1a1a",
    radius: 8,
  }),
};

export const SOLID_LOGO_ASSETS: Record<LogoId, LogoAssetSpec> = {
  sol: fullAsset(solidPath("sol"), designAsset("8893db35-997c-4730-a2ab-8ba1cd557ff1")),
  sanctum: fullAsset(solidPath("sanctum"), designAsset("d60a1c18-69e6-4aaf-9708-8b49ee446c3a")),
  helius: fullAsset(solidPath("helius"), designAsset("568f47d8-699a-4057-82aa-6b52ceac3f3c")),
  jup: fullAsset(solidPath("jup"), designAsset("78b01497-b849-443f-aaa8-43baab41c3f3")),
  phantom: fullAsset(solidPath("phantom"), designAsset("d2476fff-b958-41d2-afed-00ddf65e1b41")),
  "helius-orb": fullAsset(solidPath("helius-orb"), designAsset("776017ca-796a-4163-a1a4-b7e951bd5fb8")),
  backpack: insetAsset(solidPath("backpack"), designAsset("c0ec9d16-47d9-4ae3-bf4b-8578e180ac07"), 17.85, 25.892, 7.0753, 3.0542),
  solflare: maskedCenteredAsset(
    solidPath("solflare-fill"),
    designAsset("2a3c92aa-1106-45fc-9fec-7aa2f4c80d2f"),
    [solidPath("solflare-mask")],
    [designAsset("d0b42330-cd1b-4da2-a354-5cb4d6ae412b")],
    24.451,
    25.968
  ),
  "sanctum-gateway": fullAsset(solidPath("sanctum-gateway"), designAsset("2f2cdfa1-0e9c-492b-af8b-1ad53ae2820c")),
  perena: fullAsset(solidPath("perena"), designAsset("d7914b55-3503-4e48-b3a4-75646aedd484")),
  superteam: fullAsset(solidPath("superteam"), designAsset("12763411-2fb8-4378-9f8b-4f43459b835d")),
  carrot: centeredAsset(solidPath("carrot"), designAsset("796da27a-50af-4c0e-9cf1-6f330cf8438c"), 26, 26),
  oro: fullAsset(solidPath("oro"), designAsset("8128f199-3ca4-462a-970f-854b51338ddc")),
  altitude: fullAsset(solidPath("altitude"), designAsset("7beac5b7-7e56-4f5c-bf04-ffa89b4ad2d9")),
  dflow: fullAsset(solidPath("dflow"), designAsset("03070d29-daef-4389-9229-3db8dfc096fe")),
  "pump-fun": centeredAsset(solidPath("pump-fun"), designAsset("e109fd96-1964-439a-80ab-e43f6c1f6a6d"), 28.002, 28.857),
  "usd-prime": insetAsset(solidPath("usd-prime"), designAsset("2e225778-86dc-4ecb-85fc-962d69001681"), 27.976, 27.976, 2.02, 2.01),
  fuse: centeredAsset(solidPath("fuse"), designAsset("982e0088-a0b7-4b58-a7ce-7373375b3379"), 27.985, 27.594),
  "usd-star": insetAsset(solidPath("usd-star"), designAsset("255dd73a-37a9-46d5-b034-13381c6b50be"), 27.987, 28.021, 2.01, 1.99),
  xstock: fullAsset(solidPath("xstock"), designAsset("08dc64ad-39ab-4537-971e-605102d76b75")),
  "magic-eden": fullAsset(solidPath("magic-eden"), designAsset("1160606f-fdae-4cb4-9679-4696aba4d61d")),
  colosseum: fullAsset(solidPath("colosseum"), designAsset("5f998275-1f92-4382-81fc-a8ff2cb67a4a")),
  scloud: centeredAsset(solidPath("scloud"), designAsset("1d045ea8-3fe1-4a78-9757-8fd759a36948"), 27.992, 27.541),
  crossmint: fullAsset(solidPath("crossmint"), designAsset("ba53a4ed-a498-4650-9b64-cf13f5ce1ca8")),
  marginfi: fullAsset(solidPath("marginfi"), designAsset("53d5bc71-0023-44ed-8a3c-cb0f9a99fc16")),
  kamino: fullAsset(solidPath("kamino"), designAsset("d57ec4c0-fb0a-4abf-a46a-e7917aa5014b")),
  infsol: fullAsset(solidPath("infsol"), designAsset("d0b28078-8dc3-4605-9f69-e84051ca5150")),
  moonshot: fullAsset(solidPath("moonshot"), designAsset("bdae6c80-7beb-4888-a69f-b9e97fae9e10")),
  umbra: fullAsset(solidPath("umbra"), designAsset("60d80bca-2ffc-4b40-9f2e-343e97babc06")),
  arcium: centeredAsset(solidPath("arcium"), designAsset("d84fb675-a93d-405c-9316-bdd68610c553"), 25.37, 18.372),
  bonk: fullAsset(solidPath("bonk"), designAsset("a5e8fa8d-05fb-408c-a0dd-60a873641ecd")),
  kast: fullAsset(solidPath("kast"), designAsset("c7119ee5-3409-4644-a66b-5ad29d7fbf75")),
  asgard: fullAsset(solidPath("asgard"), designAsset("f7714512-2bbd-4d7e-84cd-f0c990afc374")),
  fomo: fullAsset(solidPath("fomo"), designAsset("880ab301-c1ea-4c71-b94e-3fc7f91b7e36")),
  "jupiter-lend": fullAsset(solidPath("jupiter-lend"), designAsset("0466dd89-9bea-44b8-a2cc-69c4269abf72")),
  moonpay: fullAsset(solidPath("moonpay"), designAsset("2acc0f83-3c31-4505-8c35-ed9cc8392c31")),
  jto: centeredAsset(solidPath("jto"), designAsset("ac851e33-1180-45c9-b141-546ae04316fc"), 28, 28),
  sendai: fullAsset(solidPath("sendai"), designAsset("c0347ec1-4b87-4652-b464-cc9d4b31bbe6")),
  eurc: fullAsset(solidPath("eurc"), designAsset("ae02ac5d-7ce3-4d8b-af13-b16fe0bbc4ab")),
  usdc: insetAsset(solidPath("usdc"), designAsset("67deddda-99a6-4345-8bf4-f69d141fc3c1"), 27.961, 27.146, 2.02, 2.43),
  circle: insetAsset(solidPath("circle"), designAsset("40eb174e-c71b-40b8-84ec-26eed7d9804d"), 27.953, 27.953, 2.01, 2.03),
  bags: fullAsset(solidPath("bags"), designAsset("2851ad29-c093-42b4-a250-18bdbca33fcb")),
  "powered-by-solana": centeredAsset(solidPath("powered-by-solana"), designAsset("ca7c0387-fb65-4fc8-a46a-84bcd7ceba43"), 27.996, 8.735),
  jupusd: insetAsset(solidPath("jupusd"), designAsset("b1792cb1-36b3-469b-8039-3d6c1fcd03a8"), 25.172, 25.173, 3.4, 3.41),
  jitosol: insetAsset(solidPath("jitosol"), designAsset("428612fe-2547-4f94-b7a7-c7a18597e3e9"), 28, 28, 2, 2),
  madlads: {
    layers: [
      {
        src: solidPath("madlads-fill"),
        remote: designAsset("11000e06-e5c8-42c5-a5c8-871f0807c376"),
        width: 27.991,
        height: 27.991,
        x: 2.0045,
        y: 2.0045,
        maskSrcs: [solidPath("madlads-mask-a"), solidPath("madlads-mask-b")],
        maskRemotes: [
          designAsset("76dd8bf0-6651-44e1-bc94-bb7c0e9fe509"),
          designAsset("aec088c7-97ae-47ed-8b15-e6f09c8399da"),
        ],
        maskPositions: "0px 0px, -0.026px -0.003px",
        maskSizes: "100% 100%, 100% 100%",
      },
    ],
  },
  opos: centeredAsset(solidPath("opos"), designAsset("35fa0ee8-9e4b-47a4-896d-4a563547e996"), 27.996, 11.485),
  "drip-haus": fullAsset(solidPath("drip-haus"), designAsset("6668cf8e-550f-455b-823c-ed0bbd6c9adf")),
  jupsol: insetAsset(solidPath("jupsol"), designAsset("a7981ce8-a0bf-4110-a574-1663b59e565d"), 27.992, 27.992, 2, 2.03),
  metadao: {
    layers: [
      {
        src: solidPath("metadao-fill"),
        remote: designAsset("c892bd4a-f301-4091-be71-67fc92ba26d1"),
        width: 22.423,
        height: 22.423,
        x: 4.7885,
        y: 4.7885,
        maskSrcs: [solidPath("metadao-mask")],
        maskRemotes: [designAsset("0d295572-6028-44ca-ba0d-84e16bab6b59")],
        maskSizes: "100% 100%",
      },
    ],
  },
  meteora: centeredAsset(solidPath("meteora"), designAsset("b21514c0-8bef-44af-91ba-d8ee625ab10c"), 25.538, 27.666),
  jito: insetAsset(solidPath("jito"), designAsset("081b929c-4531-4b90-834a-0dc71800e50d"), 27.996, 11.514, 2, 10.77),
  marinade: centeredAsset(solidPath("marinade"), designAsset("34b459c0-bce9-42b9-a8ae-50b27de27a00"), 28, 18.943),
  metaplex: fullAsset(solidPath("metaplex"), designAsset("08fe7c37-0c5d-4155-959d-b8b1f143a68f")),
  raydium: fullAsset(solidPath("raydium"), designAsset("735d7d09-976b-45c0-a86d-eea2c291dc17")),
  zora: fullAsset(solidPath("zora"), designAsset("5ca52369-69e5-4784-8865-2fc44598ea03")),
  claynosaurz: centeredAsset(solidPath("claynosaurz"), designAsset("328c7486-8ada-42b1-9c87-abdce11de255"), 27.991, 26.241),
  seeker: fullAsset(solidPath("seeker"), designAsset("9d882479-4126-4ee0-8abd-e66afff600c4")),
  avici: fullAsset(solidPath("avici"), designAsset("b3953db5-4612-4f86-89c0-daffc96d9622")),
  squads: fullAsset(solidPath("squads"), designAsset("cb28d980-3ab0-42b5-a244-db3871750d4f")),
  usdt: fullAsset(solidPath("usdt"), designAsset("d310863e-f62f-46b6-abdb-ea96d0ed28c7")),
};

export function getLogoAssetSpec(
  id: string,
  variant: LogoVariant
): LogoAssetSpec | null {
  const assetMap = variant === "brand" ? BRAND_LOGO_ASSETS : SOLID_LOGO_ASSETS;
  return id in assetMap ? assetMap[id as LogoId] : null;
}

function getLogoSpecBounds(spec: LogoAssetSpec) {
  if (spec.background || spec.layers.length === 0) {
    return {
      minX: 0,
      minY: 0,
      maxX: BASE_SIZE,
      maxY: BASE_SIZE,
      width: BASE_SIZE,
      height: BASE_SIZE,
    };
  }

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  spec.layers.forEach((layer) => {
    minX = Math.min(minX, layer.x);
    minY = Math.min(minY, layer.y);
    maxX = Math.max(maxX, layer.x + layer.width);
    maxY = Math.max(maxY, layer.y + layer.height);
  });

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(0, maxX - minX),
    height: Math.max(0, maxY - minY),
  };
}

function logoSpecHasIntrinsicSurface(spec: LogoAssetSpec) {
  if (spec.background) return true;

  const bounds = getLogoSpecBounds(spec);
  return (
    bounds.minX <= 0 &&
    bounds.minY <= 0 &&
    bounds.maxX >= BASE_SIZE &&
    bounds.maxY >= BASE_SIZE
  );
}

export function logoVariantHasIntrinsicSurface(
  id: string,
  variant: LogoVariant
) {
  const spec = getLogoAssetSpec(id, variant);
  if (!spec) return false;
  return logoSpecHasIntrinsicSurface(spec);
}

export function getBalancedLogoScale(id: string, variant: LogoVariant) {
  const spec = getLogoAssetSpec(id, variant);
  if (!spec || logoSpecHasIntrinsicSurface(spec)) {
    return 1;
  }

  const bounds = getLogoSpecBounds(spec);
  const maxDimension = Math.max(bounds.width, bounds.height);
  if (maxDimension <= 0) {
    return 1;
  }

  return Math.min(
    MAX_BALANCED_LOGO_SCALE,
    Math.max(1, BALANCED_LOGO_TARGET / maxDimension)
  );
}
