#!/usr/bin/env bash
# Downloads brand-colored icon SVGs/PNGs from the local asset server
# Run: bash scripts/download-design-icons.sh

set -e
BASE="http://localhost:3845/assets"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ICONS="$ROOT/icons"

dl() {
  local id="$1" cat="$2" hash="$3" ext="${4:-svg}"
  mkdir -p "$ICONS/$cat"
  curl -sL "$BASE/$hash.$ext" -o "$ICONS/$cat/$id.$ext" && echo "  ✓ $cat/$id.$ext"
}

echo "⬇  Downloading brand icons from the design asset server…"

# ── Tokens ──────────────────────────────────────────────────────
dl sol              tokens  3d86778ab11356cfd294673758237cd0f5e87db3
dl jup              tokens  9594a551114a47511c9bc603e6e8e260101dbc72
dl ray              tokens  eb04d8d03838f82d4a663d6dff4331f8ee8af7d0
dl jto              tokens  50ce7d61b28649c4614c5011d326f194660b59e6
dl bonk             tokens  c548d85114641a0f3ec6bdd13c76f75a37c57bb6
dl usdc             tokens  259bcfb8b9e3be988a7a4284291ff75f43fc9b66
dl usdt             tokens  41c221048a45b89ad3e5bfd180153dd82cd05ebf
dl jitosol          tokens  64a9439b61eb58a8db1918d8fba69b5e441b8645
dl cloud            tokens  470f852693151b18686568e15d8c495b7e74571a
dl eurc             tokens  d7eaec2388cfb83ef146fd3de033cab9f64186f3
dl jupsol           tokens  1e28b77d4ba3cea2abbc1a99e1d29403fc170c6a
dl jupusd           tokens  ed5a31e56842a102e0b455f370ba30d17866c391
dl usd-prime        tokens  89893a0bfabb05dfaa00bd65ea97d1a1dd867be3
dl usd-star         tokens  be8ab2b72472e1e5b811ac3f78d59550e359fbc2
dl oro              tokens  5085cdd93de742ead17ff83c4feeb6366ae93cf4

# ── Wallets ──────────────────────────────────────────────────────
dl phantom          wallets 50d21593138a66db22cd1ac8421c0c53de31c62e
dl backpack         wallets c5ee96e962f33a3a15884a1643040c1f904e6f43
dl seeker           wallets 6869d61ac3a63d151ca504d30d7b9be95111b465

# ── DeFi ────────────────────────────────────────────────────────
dl jupiter-protocol defi    9594a551114a47511c9bc603e6e8e260101dbc72
dl raydium-protocol defi    eb04d8d03838f82d4a663d6dff4331f8ee8af7d0
dl drift            defi    a64df84059da7706413dc444afd373a6af6d4bb5 png
dl kamino           defi    541ff8a0aea7a138875f77e057c790af0a73c5f1
dl marginfi         defi    cbeedcfc625bfb4efca9ee0888cb5625a19a1045
dl jito-protocol    defi    4a7188ef83f6e2b25bf270c121bafd150f40e07c
dl sanctum          defi    a364121d5b61e11ddef8a6d834932e8221d7d4dd
dl marinade         defi    1dbb339ecf9accd4a763916e8d2ae0f51f5db578
dl kast             defi    b1b7209bbf47805c50d022cf80da13782a4d4195
dl bags             defi    85de33dc57c4f5410f70693bde48136849360d0c
dl meteora          defi    7aab7c3a14ee6d8a981fcf0012ce0a84f4e36fc6
dl perena           defi    df1f2d297f4845598c9c079617270f3cf35dbd77
dl sanctum-gateway  defi    676346bf0e9f236883d5d7f9d28fdedc9cb85e63
dl umbra            defi    46c8c982070e128651da5935c86d90638274f330
dl altitude         defi    1207630cd8434056769ee66d16294b40ef49832d
dl fuse             defi    c93bde983982d003550d4415743ee379f7b2e4f2
dl dflow            defi    3ef0b7a99566687ee57262136e21b0c237282a52
dl carrot           defi    07baddac0cc82739b4e812f242316bc973d63a3d
dl fomo             defi    0fc92e722a5edc5284f518ca5f3d0ad4727e65d6
dl jupiter-lend     defi    b00b30decc598464cbf11ece850795e4977c52b3
dl avici            defi    7981f716623f0016b4e6e2fac1588507f96a5924 png
dl asgard           defi    33695a49bec6dad58d9497d9a2dab1c4898cdc0a
dl xstock           defi    91c3018c01b048efc104b7186cbe068c06691084

# ── NFT ─────────────────────────────────────────────────────────
dl magic-eden       nft     651d123337c34f915a1a8a1421722ffbca06fb73
dl metaplex         nft     152fd16888236309ba7c27084ec10db2d06c8f8e
dl zora             nft     1282f9ee77ef575aeb6e7be5ef8193e03aaed51c
dl drip-haus        nft     656a3b8aedacbe7d4832a7e8e3e3f4b5873e7534
dl madlads          nft     244351ff1154169dfda5e2bec8e0a1b4fb3d894e

# ── Infrastructure ───────────────────────────────────────────────
dl helius           infrastructure 3dae76af9034142ca85eb02e66bd65cbfb7520c1
dl pump-fun         infrastructure e167ff2bf15c679d088d0edd5d3b35564d727d2c
dl helius-orb       infrastructure 82fc2efe18c9f0f68489078315cc6a956c02e432
dl arcium           infrastructure ffbfefacc2c11711b4ee1df8dc03b591bcdf3f01
dl moonpay          infrastructure 94e5ec1c8245f1e9120dd17f56f6e852f333372b
dl squads           infrastructure b7aece7105844478b13940baac332162548c6e9e
dl superteam        infrastructure a6dcf22785b02c5732fc1041d8cf5a081d555be3
dl crossmint        infrastructure ae6121fbbbb31604f6539cca67bb43908ab53b8d
dl colosseum        infrastructure 4d81f029c930fb442e357e420ec0321059bb4ed9
dl moonshot         infrastructure 4fcb3769bc4d11754e359088af8569d5f1095947
dl opos             infrastructure 74d1b863332bcb2ffac6e750f81ea0a5723fe1aa
dl powered-by-solana infrastructure 8a8241cf5a89007383ec4fdbf392749030c9cb22

echo ""
echo "✅  Done. Run 'pnpm copy-icons' to sync to public/."
