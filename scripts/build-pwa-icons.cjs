
const fs = require("fs");
const path = require("path");

async function main() {
  const root = path.join(__dirname, "..");
  const iconsDir = path.join(root, "public", "icons");

  const candidates = [
    "icon-source.png",
    "icon-source.jpg",
    "icon-source.jpeg",
    "icon-source.webp",
  ];

  let src = null;
  for (const name of candidates) {
    const p = path.join(iconsDir, name);
    if (fs.existsSync(p)) {
      src = p;
      break;
    }
  }

  if (!src) {
    console.error(
      "Missing source image. Add one of:\n  " +
        candidates.map((n) => path.join("public", "icons", n)).join("\n  "),
    );
    process.exit(1);
  }

  const sharp = require("sharp");
  const out192 = path.join(iconsDir, "icon-192.png");
  const out512 = path.join(iconsDir, "icon-512.png");

  await sharp(src).resize(192, 192).png().toFile(out192);
  await sharp(src).resize(512, 512).png().toFile(out512);

  console.log("Wrote:", out192);
  console.log("Wrote:", out512);
  console.log("From:", path.relative(root, src));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
