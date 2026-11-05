import puppeteer from "/Applications/HyperFrames.app/Contents/Resources/app.asar.unpacked/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js";
import path from "node:path";
import fs from "node:fs";
import { spawn, execSync } from "node:child_process";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const projectDir = path.resolve(import.meta.dirname, "..");
const htmlPath = "file://" + path.join(projectDir, "receipt.html");
const rendersDir = path.join(projectDir, "renders");
const rawMp4 = path.join(rendersDir, "usdc_yield_receipt_raw.mp4");
const outMp4 = path.join(rendersDir, "usdc_yield_receipt.mp4");
const outGif = path.join(rendersDir, "usdc_yield_receipt_preview.gif");
const audioBed = path.join(projectDir, "assets", "audio_bed.mp3");

fs.mkdirSync(rendersDir, { recursive: true });

async function renderReceipt() {
  console.log("Starting deterministic render for USDC Yield Receipt (6s @ 30fps = 180 frames, 1080x1920 vertical)...");

  const ffmpeg = spawn("ffmpeg", [
    "-y",
    "-f", "image2pipe",
    "-vcodec", "png",
    "-r", "30",
    "-i", "-",
    "-c:v", "libx264",
    "-preset", "fast",
    "-crf", "18",
    "-pix_fmt", "yuv420p",
    rawMp4
  ]);

  ffmpeg.stderr.on("data", () => {});

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1080,1920", "--hide-scrollbars"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

  await page.goto(htmlPath, { waitUntil: "networkidle0" });

  const totalFrames = 180;
  const fps = 30;

  for (let i = 0; i < totalFrames; i++) {
    const t = i / fps;
    await page.evaluate((time) => {
      if (window.__timelines && window.__timelines["receipt"]) {
        window.__timelines["receipt"].seek(time);
      }
    }, t);

    const buf = await page.screenshot({ type: "png" });
    ffmpeg.stdin.write(buf);

    if (i % 30 === 0 || i === totalFrames - 1) {
      console.log(`Rendered frame ${i + 1}/${totalFrames} (${t.toFixed(2)}s)`);
    }
  }

  ffmpeg.stdin.end();

  await new Promise((resolve, reject) => {
    ffmpeg.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });

  await browser.close();
  console.log("Adding audio bed to receipt video...");

  // Combine with audio bed
  execSync(`ffmpeg -y -i "${rawMp4}" -i "${audioBed}" -c:v copy -c:a aac -b:a 192k -shortest "${outMp4}"`);
  fs.unlinkSync(rawMp4);

  console.log("Generating high-res animated preview GIF...");
  execSync(`ffmpeg -y -i "${outMp4}" -vf "fps=15,scale=360:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "${outGif}"`);

  console.log(`Successfully rendered Milestone 2 deliverable: ${outMp4}`);
  console.log(`Generated preview GIF: ${outGif}`);
}

renderReceipt().catch((err) => {
  console.error("Render failed:", err);
  process.exit(1);
});
