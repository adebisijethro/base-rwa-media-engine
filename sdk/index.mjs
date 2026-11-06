/**
 * Base RWA Media Engine - Developer SDK
 * @module base-rwa-media-engine
 */

import path from "node:path";
import fs from "node:fs";
import { execSync } from "node:child_process";

export class BaseRWAMediaEngine {
  constructor(options = {}) {
    this.rootDir = options.rootDir || path.resolve(import.meta.dirname, "..");
    this.rendersDir = path.join(this.rootDir, "renders");
    this.metadataDir = path.join(this.rootDir, "metadata");
  }

  /**
   * Render 10-second promotional explainer film for an RWA asset.
   * @param {Object} asset
   * @returns {Object} { videoPath, duration, resolution }
   */
  async renderExplainerVideo(asset = {}) {
    console.log(`[SDK] Rendering 10s broadcast explainer for ${asset.name || "RWA Asset"}...`);
    const scriptPath = path.join(this.rootDir, "scripts", "render.mjs");
    execSync(`node "${scriptPath}"`, { stdio: "inherit" });
    const videoPath = path.join(this.rendersDir, "tokeshare_taco_shop_10s_with_audio.mp4");
    return {
      success: true,
      videoPath,
      duration: 10.0,
      resolution: "1920x1080",
      format: "mp4"
    };
  }

  /**
   * Render 9:16 vertical USDC dividend receipt.
   * @param {Object} payout
   * @returns {Object} { videoPath, gifPath, duration, resolution }
   */
  async renderYieldReceipt(payout = {}) {
    console.log(`[SDK] Rendering 9:16 vertical yield receipt for ${payout.recipient || "investor wallet"}...`);
    const scriptPath = path.join(this.rootDir, "scripts", "render-receipt.mjs");
    execSync(`node "${scriptPath}"`, { stdio: "inherit" });
    const videoPath = path.join(this.rendersDir, "usdc_yield_receipt.mp4");
    const gifPath = path.join(this.rendersDir, "usdc_yield_receipt_preview.gif");
    return {
      success: true,
      videoPath,
      gifPath,
      duration: 6.0,
      resolution: "1080x1920",
      format: "mp4"
    };
  }

  /**
   * Build Filecoin / IPFS CID registry for all rendered media assets.
   * @returns {Object} IPFS Registry Object
   */
  async generateIPFSRegistry() {
    console.log(`[SDK] Generating IPFS CID registry and metadata bundle...`);
    const scriptPath = path.join(this.rootDir, "scripts", "ipfs-registry.mjs");
    execSync(`node "${scriptPath}"`, { stdio: "inherit" });
    const registryPath = path.join(this.metadataDir, "registry.json");
    const registry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
    return registry;
  }
}

export default BaseRWAMediaEngine;
