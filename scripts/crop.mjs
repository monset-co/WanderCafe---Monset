// One-off: cut dish photos out of the menu posters in resources/ into public/food/ (run: node scripts/crop.mjs)
// File names match item ids' `img` in src/data/menu.js.
import sharp from "sharp";
const r = "resources/", o = "public/food/";
const jobs = [
  ["1000004303.png", "breakfast", { left: 860, top: 240, width: 554, height: 610 }],
  ["1000004303.png", "rise-shine", { left: 0, top: 820, width: 540, height: 600 }],
  ["1000004303.png", "cheese-ramen", { left: 970, top: 1280, width: 444, height: 610 }],
  ["1000004304.png", "waffle", { left: 860, top: 240, width: 554, height: 610 }],
  ["1000004304.png", "pancake", { left: 0, top: 800, width: 540, height: 600 }],
  ["1000004304.png", "parfait", { left: 970, top: 1280, width: 444, height: 610 }],
  ["1000004305.png", "plate", { left: 880, top: 255, width: 534, height: 610 }],
  ["1000004306.png", "sandwich", { left: 910, top: 1025, width: 504, height: 610 }],
  ["1000016679.png", "carbonara", { left: 0, top: 140, width: 320, height: 380 }],
  ["1000016679.png", "penne", { left: 680, top: 190, width: 344, height: 370 }],
  ["1000016679.png", "sotanghon", { left: 500, top: 1230, width: 524, height: 210 }],
  ["1000016844.png", "ramen", { left: 560, top: 40, width: 460, height: 440 }],
  ["1000016844.png", "pancit", { left: 0, top: 700, width: 440, height: 400 }],
  ["1000016845.png", "halohalo", { left: 400, top: 470, width: 560, height: 680 }],
  // second batch: Facebook exports, matched by the id their file name starts with
  ["925588851", "chicken", { left: 600, top: 930, width: 847, height: 1000 }],
  ["929591221", "pho", { left: 730, top: 200, width: 670, height: 680 }],
  ["929591221", "viet-salad", { left: 0, top: 850, width: 660, height: 700 }],
  ["929591221", "lumpia", { left: 760, top: 1340, width: 654, height: 640 }],
  ["920737873", "crispy-pata", { left: 0, top: 300, width: 1536, height: 1536 }],
  ["932039238", "pasta-sardines", { left: 100, top: 100, width: 1848, height: 1848 }],
];
const files = (await import("node:fs")).readdirSync(r);
for (const [f, n, box] of jobs)
  await sharp(r + (files.find((x) => x.startsWith(f)) ?? f)).extract(box).resize({ width: 640, withoutEnlargement: true }).webp({ quality: 80 }).toFile(o + n + ".webp");
