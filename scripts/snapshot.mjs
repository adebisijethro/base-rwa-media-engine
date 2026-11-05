import puppeteer from "/Applications/HyperFrames.app/Contents/Resources/app.asar.unpacked/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js";
import path from "node:path";
import fs from "node:fs";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const projectDir = path.resolve(import.meta.dirname, "..");
const htmlPath = "file://" + path.join(projectDir, "index.html");
const stillsDir = path.join(projectDir, "boards", "stills");

fs.mkdirSync(stillsDir, { recursive: true });

const shots = [
  { time: 1.2, name: "frame-00-at-1.2s.png", label: "01: The Taco Shop" },
  { time: 3.8, name: "frame-01-at-3.8s.png", label: "02: 1,000 On-chain Shares" },
  { time: 6.4, name: "frame-02-at-6.4s.png", label: "03: Stablecoin Payouts" },
  { time: 8.8, name: "frame-03-at-8.8s.png", label: "04: Tokeshare Outro" }
];

async function capture() {
  console.log("Launching Chrome...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1920,1080", "--hide-scrollbars"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  console.log("Navigating to", htmlPath);
  await page.goto(htmlPath, { waitUntil: "networkidle0" });

  for (const shot of shots) {
    console.log(`Seeking to ${shot.time}s...`);
    await page.evaluate((t) => {
      if (window.__timelines && window.__timelines["main"]) {
        window.__timelines["main"].seek(t);
      }
    }, shot.time);

    // Give browser a moment to repaint
    await new Promise((r) => setTimeout(r, 250));

    const outPath = path.join(stillsDir, shot.name);
    await page.screenshot({ path: outPath, type: "png" });
    console.log(`Saved ${shot.name}`);
  }

  await browser.close();
  console.log("Snapshot capture complete!");
}

capture().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
