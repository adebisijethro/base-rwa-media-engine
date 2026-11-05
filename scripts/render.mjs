import puppeteer from "/Applications/HyperFrames.app/Contents/Resources/app.asar.unpacked/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js";
import path from "node:path";
import fs from "node:fs";
import { spawn } from "node:child_process";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const projectDir = path.resolve(import.meta.dirname, "..");
const htmlPath = "file://" + path.join(projectDir, "index.html");
const rendersDir = path.join(projectDir, "renders");
const outMp4 = path.join(rendersDir, "tokeshare_taco_shop_10s.mp4");

fs.mkdirSync(rendersDir, { recursive: true });

async function render() {
  console.log("Starting deterministic frame render for Tokeshare (10s @ 30fps = 300 frames)...");
  
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
    outMp4
  ]);

  ffmpeg.stderr.on("data", (d) => {
    // console.log("ffmpeg:", d.toString());
  });

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1920,1080", "--hide-scrollbars"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  await page.goto(htmlPath, { waitUntil: "networkidle0" });

  const totalFrames = 300;
  const fps = 30;

  for (let i = 0; i < totalFrames; i++) {
    const t = i / fps;
    await page.evaluate((time) => {
      if (window.__timelines && window.__timelines["main"]) {
        window.__timelines["main"].seek(time);
      }
    }, t);

    const buf = await page.screenshot({ type: "png" });
    ffmpeg.stdin.write(buf);

    if (i % 30 === 0 || i === totalFrames - 1) {
      console.log(`Rendered frame ${i + 1}/${totalFrames} (${(t).toFixed(2)}s)`);
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
  console.log(`Successfully rendered video to: ${outMp4}`);
}

render().catch((err) => {
  console.error("Render failed:", err);
  process.exit(1);
});
