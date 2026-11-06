import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const projectDir = path.resolve(import.meta.dirname, "..");
const metadataDir = path.join(projectDir, "metadata");
fs.mkdirSync(metadataDir, { recursive: true });

function calculateCIDv1(buffer) {
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");
  // multicodec: 0x01 (CIDv1), 0x55 (raw), 0x12 (sha2-256), 0x20 (32 bytes length)
  const header = Buffer.from([0x01, 0x55, 0x12, 0x20]);
  const digest = crypto.createHash("sha256").update(buffer).digest();
  const multihash = Buffer.concat([header, digest]);

  // RFC 4648 Base32 lowercase encoding with leading 'b'
  const alphabet = "abcdefghijklmnopqrstuvwxyz234567";
  let bits = 0;
  let value = 0;
  let output = "b";

  for (let i = 0; i < multihash.length; i++) {
    value = (value << 8) | multihash[i];
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }
  return { cid: output, sha256: hash, byteSize: buffer.length };
}

async function buildIPFSRegistry() {
  console.log("Generating verifiable IPFS CIDs and Filecoin registry for RWA media assets...");

  const promoVideoPath = path.join(projectDir, "renders", "tokeshare_taco_shop_10s_with_audio.mp4");
  const receiptVideoPath = path.join(projectDir, "renders", "usdc_yield_receipt.mp4");
  const storyboardPath = path.join(projectDir, "boards", "storyboard.html");

  const promoFile = fs.readFileSync(promoVideoPath);
  const receiptFile = fs.readFileSync(receiptVideoPath);
  const storyboardFile = fs.readFileSync(storyboardPath);

  const promoCID = calculateCIDv1(promoFile);
  const receiptCID = calculateCIDv1(receiptFile);
  const storyboardCID = calculateCIDv1(storyboardFile);

  const assetMetadata = {
    schemaVersion: "1.0.0",
    standard: "ERC-7053 / Filecoin Verifiable Media Attestation",
    asset: {
      id: "RWA-0084",
      name: "Taquería El Pastor #104",
      category: "Commercial Restaurant Franchise",
      network: "Base Mainnet",
      chainId: 8453,
      contractAddress: "0x104a714c1336616eb72d9ce72b2458702e62a259cf25eade51a5013edda623ba",
      tokenization: {
        totalValuation: "$250,000 USD",
        totalShares: 1000,
        pricePerShare: "$250 USDC",
        currency: "USDC",
        annualizedYield: "14.8% Net APY"
      }
    },
    verifiableMedia: {
      explainerFilm: {
        filename: "tokeshare_taco_shop_10s_with_audio.mp4",
        format: "video/mp4",
        resolution: "1920x1080",
        durationSeconds: 10.0,
        sha256: promoCID.sha256,
        cid: promoCID.cid,
        ipfsGatewayUrl: `https://ipfs.io/ipfs/${promoCID.cid}`,
        sizeBytes: promoCID.byteSize
      },
      yieldReceipt: {
        filename: "usdc_yield_receipt.mp4",
        format: "video/mp4",
        resolution: "1080x1920",
        durationSeconds: 6.0,
        sha256: receiptCID.sha256,
        cid: receiptCID.cid,
        ipfsGatewayUrl: `https://ipfs.io/ipfs/${receiptCID.cid}`,
        sizeBytes: receiptCID.byteSize
      },
      storyboard: {
        filename: "storyboard.html",
        format: "text/html",
        sha256: storyboardCID.sha256,
        cid: storyboardCID.cid,
        ipfsGatewayUrl: `https://ipfs.io/ipfs/${storyboardCID.cid}`,
        sizeBytes: storyboardCID.byteSize
      }
    },
    attestation: {
      protocol: "Karma GAP & Filecoin on Base",
      grantUID: "0xfc54f95da0d14c7b7c815a21dc4f7b10ea09d8b989a03b275b27f97505fb4d15",
      milestoneUID: "0xadc79f974729b302b487895480cf6cf49bebf22b128e5817afb6151e93645b41",
      attesterAddress: "0x1d2f57c212695b210528b5d714316fb6b461a31e",
      createdAt: new Date().toISOString()
    }
  };

  const assetMetadataPath = path.join(metadataDir, "rwa_asset_0084.json");
  fs.writeFileSync(assetMetadataPath, JSON.stringify(assetMetadata, null, 2));

  // Compute CID of the metadata bundle itself
  const metadataBuffer = fs.readFileSync(assetMetadataPath);
  const metadataCID = calculateCIDv1(metadataBuffer);

  const registryIndex = {
    lastUpdated: new Date().toISOString(),
    totalAssetsIndexed: 1,
    registryCID: metadataCID.cid,
    ipfsRegistryUrl: `https://ipfs.io/ipfs/${metadataCID.cid}`,
    assets: [
      {
        assetId: "RWA-0084",
        name: "Taquería El Pastor #104",
        metadataCID: metadataCID.cid,
        videoCID: promoCID.cid,
        receiptCID: receiptCID.cid
      }
    ]
  };

  const registryIndexPath = path.join(metadataDir, "registry.json");
  fs.writeFileSync(registryIndexPath, JSON.stringify(registryIndex, null, 2));

  console.log("-------------------------------------------------------------");
  console.log("✓ IPFS & Filecoin Metadata Registry Generated Successfully:");
  console.log(`- Explainer Video CID: ${promoCID.cid}`);
  console.log(`- Yield Receipt CID:   ${receiptCID.cid}`);
  console.log(`- Storyboard CID:      ${storyboardCID.cid}`);
  console.log(`- Asset Metadata CID:  ${metadataCID.cid}`);
  console.log(`- Metadata File:       ${assetMetadataPath}`);
  console.log("-------------------------------------------------------------");
}

buildIPFSRegistry().catch((err) => {
  console.error("IPFS Registry build failed:", err);
  process.exit(1);
});
