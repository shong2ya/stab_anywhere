// node list-egg-cells.js
const fs = require("fs");
const path = require("path");

const src = fs.readFileSync(path.join(__dirname, "easter-eggs.js"), "utf8");
const global = {};
eval(src);

const TOTAL = 625;
const rate = global.EASTER_EGG_RATE ?? 0.1;
const defaultWeights = global.EGG_PART_WEIGHTS || {
  image: 0.45,
  media: 0.45,
  both: 0.1,
};
const youtubeWeights = global.EGG_YOUTUBE_PART_WEIGHTS || {
  image: 0.12,
  media: 0.53,
  both: 0.35,
};
const keys = global.EGG_ROTATION || ["pachirisu", "emolga", "tofu"];
const templates = global.EGG_TEMPLATES;

function eggPartWeights(template) {
  return template?.youtube ? youtubeWeights : defaultWeights;
}

function buildEggPayload(template, i) {
  const weights = eggPartWeights(template);
  const partRoll = ((i * 5381 + 7) % 1000) / 1000;
  const imageCut = weights.image ?? 0.45;
  const mediaCut = imageCut + (weights.media ?? 0.45);

  let mode = "both";
  if (partRoll < imageCut) mode = "image";
  else if (partRoll < mediaCut) mode = "media";

  const egg = { mode };
  if ((mode === "image" || mode === "both") && template.image) egg.hasImage = true;
  if (mode === "media" || mode === "both") {
    if (template.youtube) egg.hasMedia = "youtube";
    if (template.link) egg.hasMedia = "link";
  }
  if (!egg.hasImage && !egg.hasMedia) {
    if (template.youtube) egg.hasMedia = "youtube";
    else if (template.link) egg.hasMedia = "link";
    else if (template.image) egg.hasImage = true;
  }
  return egg;
}

let n = 0;
let youtubeCells = 0;
const counts = Object.fromEntries(Object.keys(templates).map((k) => [k, 0]));
const modes = { image: 0, media: 0, both: 0 };

for (let i = 0; i < TOTAL; i++) {
  const roll = ((i * 7919 + 1) % 1000) / 1000;
  if (roll >= rate) continue;

  const key = keys[i % keys.length];
  const template = templates[key];
  if (!template) continue;

  const egg = buildEggPayload(template, i);
  if (!egg.hasImage && !egg.hasMedia) continue;

  n++;
  counts[key] = (counts[key] || 0) + 1;
  if (egg.hasMedia === "youtube") youtubeCells++;
  if (egg.hasImage && egg.hasMedia) modes.both++;
  else if (egg.hasImage) modes.image++;
  else modes.media++;
}

console.log(`이스터에그 칸: ${n} / ${TOTAL} (${((n / TOTAL) * 100).toFixed(1)}%)`);
console.log(
  `유튜브 칸: ${youtubeCells} / ${TOTAL} (${((youtubeCells / TOTAL) * 100).toFixed(1)}%)`
);
console.log("  사진만:", modes.image, "· 미디어만:", modes.media, "· 둘 다:", modes.both);
for (const [key, count] of Object.entries(counts)) {
  if (count > 0) console.log(`${key}:`, count);
}
