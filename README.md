# Base RWA Media & Programmatic Video Engine
> **Grant Deliverable 1** · Base Ecosystem Grant (`0x616b0880d53bab86d7210963f68373ac7415fc4a025bbffe6cc7efd21ff2c172`)  
> **Milestone UID:** `0x829177fbc2a0dd4aa1e5b6916cac31ee2b9a5b973563e3ee7dc8be423a1e6b10`  
> **Author & Lead Engineer:** Jethro Adebisi ([@adebisijethro](https://github.com/adebisijethro)) · `adebisireuel@gmail.com`  
> **Target Protocol:** Tokeshare (`https://tokeshare.co/`) & Base RWA Ecosystem

---

## 🚀 Overview

The **Base RWA Media Engine** is an open-source, deterministic video generation pipeline that automates investor-facing promotional videos and on-chain dividend receipts for tokenized real-world assets on Base.

Rather than spending 2–3 weeks and thousands of dollars on manual video editing for each new property, franchise, or revenue-generating asset listing, this pipeline renders broadcast-grade 1080p motion explainers in **under 35 seconds**.

### Architecture
- **Composition Engine:** HTML5 Canvas, SVG vector matrices, and GSAP timeline synchronization with frame-safe deterministic seeking.
- **Audio Synchronization:** Calibrated 130 BPM tech-house audio bed with exact beat markers for visual cuts and revenue counters.
- **Headless Renderer:** Chromium via Puppeteer-core pipes raw RGBA frames directly into an `ffmpeg` libx264 process over stdin. Zero temporary image files on disk; 100% deterministic frame timing.

---

## 📽️ Deliverable Artifacts

### Milestone 1: Base RWA Programmatic Video Renderer (COMPLETED ✅)
* **Master 1080p MP4 Render (with Audio):** `renders/tokeshare_taco_shop_10s_with_audio.mp4` (2.10 MB)
* **Silent 1080p MP4 Render:** `renders/tokeshare_taco_shop_10s.mp4` (1.96 MB)
* **High-Res Animated GIF Preview:** `renders/tokeshare_taco_shop_preview.gif` (3.20 MB)
* **Storyboard Stills:** `boards/stills/` (`frame-00-at-1.2s.png` through `frame-03-at-8.8s.png`)
* **Interactive Storyboard Viewer:** `boards/storyboard.html`

### Milestone 2: Automated USDC Yield Receipt Visualizer (COMPLETED ✅)
* **Master Vertical 9:16 Video Receipt (with Audio):** `renders/usdc_yield_receipt.mp4` (596 KB)
* **Animated Social Preview GIF (360x640):** `renders/usdc_yield_receipt_preview.gif` (625 KB)
* **Dynamic Receipt Template:** `receipt.html` (1080x1920 vertical canvas, GSAP timeline with animated counter tick-up, live APY calculation, and Base Mainnet settlement verification)
* **Automated Receipt Render Script:** `scripts/render-receipt.mjs`

---

## 📦 How to Run the Renderer

### Prerequisites
- Node.js 18+
- Google Chrome installed (`/Applications/Google Chrome.app`)
- FFmpeg installed (`brew install ffmpeg`)

### 1. Render Asset Video (Milestone 1)
```bash
node scripts/render.mjs
```

### 2. Render Vertical USDC Yield Receipt (Milestone 2)
```bash
node scripts/render-receipt.mjs
```

### 3. Capture Storyboard Stills
```bash
node scripts/snapshot.mjs
```

### 3. Add Synchronized Audio Bed
```bash
ffmpeg -y -i renders/tokeshare_taco_shop_10s.mp4 -i assets/tech_house_bed_130bpm.mp3 \
  -c:v copy -c:a aac -b:a 192k -shortest renders/tokeshare_taco_shop_10s_with_audio.mp4
```

---

## ⛓️ On-Chain Attestation Details
* **Network:** Base Mainnet (Chain ID `8453`)
* **Project UID:** [`0x104a714c1336616eb72d9ce72b2458702e62a259cf25eade51a5013edda623ba`](https://basescan.org/tx/0x4b9f7cdfcde00aea3f196526b4b1c78de6f5d04dc2d2fa32d7bc583df740421c)
* **Grant UID:** `0x616b0880d53bab86d7210963f68373ac7415fc4a025bbffe6cc7efd21ff2c172`
* **Milestone 1 Completion Attestation UID:** `0x42cb49151d187d31bcb07c4a141aee2208a373f1c262038433660d0eb4486c3b`
* **Completion Tx Hash:** [`0x9c2ba10ef7c896f73c2949cd9c898afe410c8d2f5d563cff4a2c71146bf6acd4`](https://basescan.org/tx/0x9c2ba10ef7c896f73c2949cd9c898afe410c8d2f5d563cff4a2c71146bf6acd4)
* **Karma Project Profile:** [https://gap.karmahq.xyz/project/tokeshare-rwa-media-tokenization-engine](https://gap.karmahq.xyz/project/tokeshare-rwa-media-tokenization-engine)
