// 이 URL로 "진짜 QR"을 생성합니다. (완성된 패턴이면 휴대폰 스캔 시 여기로 연결됨)
const TARGET_URL = "https://example.com/";

function $(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el;
}

function buildTargetQr(url) {
  if (typeof qrcode !== "function") {
    throw new Error("QR library not loaded. (qrcode-generator)");
  }
  const qr = qrcode(0, "M");
  qr.addData(String(url));
  qr.make();
  const size = qr.getModuleCount();
  const target = new Uint8Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      target[i] = qr.isDark(y, x) ? 0 : 1;
    }
  }
  return { size, target };
}

const gridWrapEl = $("grid-wrap");
const bloodCanvas = $("blood-canvas");
const bloodCtx = bloodCanvas.getContext("2d");

const BLOOD = {
  fresh: ["#c41e3a", "#a81832", "#d42a48", "#b01c34"],
  wet: ["#8f1428", "#7a1224", "#9c1830"],
  dark: ["#4a0a14", "#3a0810", "#5c1020"],
  dry: ["#2a080c", "#32100e", "#3d1814", "#261008"],
};

let stabCount = 0;

function pickBlood(pool) {
  return pool[(Math.random() * pool.length) | 0];
}

function paintPixel(x, y, w, h, color) {
  bloodCtx.fillStyle = color;
  bloodCtx.fillRect(Math.round(x), Math.round(y), w, h);
}

function paintBloodStain(x, y, intensity = 1, compact = false) {
  const px = 2;
  const wet = pickBlood(BLOOD.fresh);
  const mid = pickBlood(BLOOD.wet);
  const dark = pickBlood(BLOOD.dark);
  const dry = pickBlood(BLOOD.dry);
  const blobR = compact ? 4 + 3 * intensity : 8 + 6 * intensity;
  const blobCount = compact
    ? (3 + Math.random() * 4 * intensity) | 0
    : (4 + Math.random() * 7 * intensity) | 0;
  const sprayCount = compact
    ? (1 + Math.random() * 3 * intensity) | 0
    : (2 + Math.random() * 5 * intensity) | 0;
  const sprayX = compact ? 6 + intensity * 3 : 14 + intensity * 6;
  const sprayY = compact ? 5 + intensity * 2 : 12 + intensity * 4;

  paintPixel(x, y, px * 2, px, wet);
  paintPixel(x - px, y, px, px, mid);
  paintPixel(x + px, y, px, px, mid);
  paintPixel(x, y - px, px, px, dark);
  paintPixel(x, y + px, px, px, mid);

  for (let i = 0; i < blobCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * blobR;
    const bx = x + Math.cos(angle) * r;
    const by = y + Math.sin(angle) * r * 0.85;
    const roll = Math.random();
    const c = roll < 0.28 ? wet : roll < 0.58 ? mid : roll < 0.82 ? dark : dry;
    const size = roll < 0.15 && !compact ? px + 1 : px;
    paintPixel(bx, by, size, size, c);
  }

  if (Math.random() < (compact ? 0.55 : 0.7)) {
    let dx = x + ((Math.random() - 0.5) * px) | 0;
    let dy = y + px * 1.5;
    const dripLen = compact
      ? (1 + Math.random() * (2 + intensity * 2)) | 0
      : (2 + Math.random() * (4 + intensity * 3)) | 0;
    for (let d = 0; d < dripLen; d++) {
      const dripColor = d === dripLen - 1 ? dry : d < dripLen * 0.4 ? wet : mid;
      paintPixel(dx, dy, px, px + (d === 0 ? 1 : 0), dripColor);
      dy += px + (Math.random() < 0.35 ? 1 : 0);
      dx += (Math.random() - 0.5) * 2.5;
    }
    if (Math.random() < 0.45) {
      paintPixel(dx, dy, px, px, dark);
    }
  }

  for (let s = 0; s < sprayCount; s++) {
    const sx = x + (Math.random() - 0.5) * sprayX;
    const sy = y + (Math.random() - 0.3) * sprayY;
    paintPixel(sx, sy, px, px, Math.random() < 0.35 ? wet : dark);
  }
}

function resizeBloodCanvas() {
  const rect = gridWrapEl.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  bloodCanvas.width = Math.ceil(rect.width * dpr);
  bloodCanvas.height = Math.ceil(rect.height * dpr);
  bloodCanvas.style.width = `${rect.width}px`;
  bloodCanvas.style.height = `${rect.height}px`;
  bloodCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  bloodCtx.imageSmoothingEnabled = false;
}

function splatterOnNearestMargin(cx, cy, gridRect, wrapRect) {
  const gl = gridRect.left - wrapRect.left;
  const gt = gridRect.top - wrapRect.top;
  const gr = gl + gridRect.width;
  const gb = gt + gridRect.height;

  const dTop = cy - gt;
  const dBottom = gb - cy;
  const dLeft = cx - gl;
  const dRight = gr - cx;
  const minD = Math.min(dTop, dBottom, dLeft, dRight);
  const m = 6 + Math.random() * 18;
  let px;
  let py;

  if (minD === dTop) {
    px = cx + (Math.random() - 0.5) * 36;
    py = gt - m;
  } else if (minD === dBottom) {
    px = cx + (Math.random() - 0.5) * 36;
    py = gb + m;
  } else if (minD === dLeft) {
    px = gl - m;
    py = cy + (Math.random() - 0.5) * 36;
  } else {
    px = gr + m;
    py = cy + (Math.random() - 0.5) * 36;
  }

  paintBloodStain(px, py, 0.9 + Math.random() * 0.5);
}

function marginRand() {
  return 18 + Math.random() * 14;
}

function addBloodFromStab(i) {
  stabCount++;
  const wrapRect = gridWrapEl.getBoundingClientRect();
  const gridRect = gridEl.getBoundingClientRect();
  const cell = cellEls[i].getBoundingClientRect();
  const cx = cell.left - wrapRect.left + cell.width / 2;
  const cy = cell.top - wrapRect.top + cell.height / 2;

  paintBloodStain(cx, cy, 0.7 + Math.random() * 0.35, true);

  splatterOnNearestMargin(cx, cy, gridRect, wrapRect);

  const extra = 1 + (stabCount % 4 === 0 ? 1 : 0);
  for (let e = 0; e < extra; e++) {
    const side = (Math.random() * 4) | 0;
    const gl = gridRect.left - wrapRect.left;
    const gt = gridRect.top - wrapRect.top;
    const gw = gridRect.width;
    const gh = gridRect.height;
    const m = marginRand();
    let rx;
    let ry;
    if (side === 0) {
      rx = gl + Math.random() * gw;
      ry = gt - Math.random() * m;
    } else if (side === 1) {
      rx = gl + gw + Math.random() * m;
      ry = gt + Math.random() * gh;
    } else if (side === 2) {
      rx = gl + Math.random() * gw;
      ry = gt + gh + Math.random() * m;
    } else {
      rx = gl - Math.random() * m;
      ry = gt + Math.random() * gh;
    }
    paintBloodStain(rx, ry, 0.6 + Math.random() * 0.4);
  }
}

const gridEl = $("grid");
const dialogEl = $("q-dialog");
const eggImageDialogEl = $("egg-image-dialog");
const eggMediaDialogEl = $("egg-media-dialog");
const eggImageEl = $("egg-image");
const eggYoutubeWrapEl = $("egg-youtube-wrap");
const eggYoutubeCardEl = $("egg-youtube-card");
const eggYoutubeThumbEl = $("egg-youtube-thumb");
const eggYoutubeLabelEl = $("egg-youtube-label");
const eggPreviewWrapEl = $("egg-preview-wrap");

eggYoutubeCardEl.addEventListener("click", (e) => {
  const url = eggYoutubeCardEl.getAttribute("href");
  if (!url) return;
  e.preventDefault();
  e.stopPropagation();
  window.open(url, "_blank", "noopener,noreferrer");
});
const eggPreviewEl = $("egg-preview");
const eggPreviewLabelEl = $("egg-preview-label");
const eggExternalLinkEl = $("egg-external-link");
const completeDialogEl = $("complete-dialog");
const qEnEl = $("q-en");
const qKoEl = $("q-ko");
const qMetaEl = $("q-meta");
const btnYes = $("btn-yes");
const btnNo = $("btn-no");
const btnCancel = $("btn-cancel");

const { size: SIZE, target: TARGET } = buildTargetQr(TARGET_URL);
const TOTAL_CELLS = SIZE * SIZE;

if (typeof buildQuestions !== "function") {
  throw new Error("questions.js not loaded. (buildQuestions)");
}

const QUESTIONS = buildQuestions(TOTAL_CELLS);

const cellEasterEgg = buildCellEasterEggMap();

function eggPartWeights(template) {
  if (template?.youtube) {
    return (
      globalThis.EGG_YOUTUBE_PART_WEIGHTS || {
        image: 0.12,
        media: 0.53,
        both: 0.35,
      }
    );
  }
  return (
    globalThis.EGG_PART_WEIGHTS || {
      image: 0.45,
      media: 0.45,
      both: 0.1,
    }
  );
}

function buildEggPayload(template, i) {
  const weights = eggPartWeights(template);
  const partRoll = ((i * 5381 + 7) % 1000) / 1000;
  const imageCut = weights.image ?? 0.45;
  const mediaCut = imageCut + (weights.media ?? 0.45);

  let mode = "both";
  if (partRoll < imageCut) mode = "image";
  else if (partRoll < mediaCut) mode = "media";

  const egg = {};
  if ((mode === "image" || mode === "both") && template.image) {
    egg.image = template.image;
    egg.imageAlt = template.imageAlt;
  }
  if (mode === "media" || mode === "both") {
    if (template.youtube) egg.youtube = template.youtube;
    if (template.link) egg.link = template.link;
  }

  if (!egg.image && !egg.youtube && !egg.link) {
    if (template.youtube) egg.youtube = template.youtube;
    else if (template.link) egg.link = template.link;
    else if (template.image) {
      egg.image = template.image;
      egg.imageAlt = template.imageAlt;
    }
  }

  return egg.image || egg.youtube || egg.link ? egg : null;
}

function buildCellEasterEggMap() {
  const templates = globalThis.EGG_TEMPLATES;
  const keys = globalThis.EGG_ROTATION || ["pachirisu", "emolga", "tofu"];
  const rate = globalThis.EASTER_EGG_RATE ?? 0.1;
  if (!templates || rate <= 0) return new Map();

  const map = new Map();

  for (let i = 0; i < TOTAL_CELLS; i++) {
    const roll = ((i * 7919 + 1) % 1000) / 1000;
    if (roll >= rate) continue;

    const key = keys[i % keys.length];
    const template = templates[key];
    if (!template) continue;

    const egg = buildEggPayload(template, i);
    if (egg) map.set(i, egg);
  }

  return map;
}

function youtubeVideoId(idOrUrl) {
  const s = String(idOrUrl || "");
  const m = s.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return m ? m[1] : s;
}

function youtubeWatchUrl(idOrUrl) {
  const id = youtubeVideoId(idOrUrl);
  return id ? `https://www.youtube.com/watch?v=${id}` : "";
}

function showModalDialog(dialogEl) {
  return new Promise((resolve) => {
    const afterClose = () => {
      dialogEl.removeEventListener("close", afterClose);
      resolve();
    };
    dialogEl.addEventListener("close", afterClose);
    if (typeof dialogEl.showModal === "function") dialogEl.showModal();
    else resolve();
  });
}

function youtubeThumbSrc(id) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

function setYoutubeThumb(id) {
  eggYoutubeThumbEl.src = youtubeThumbSrc(id);
  eggYoutubeThumbEl.alt = "YouTube";
  eggYoutubeThumbEl.onerror = () => {
    eggYoutubeThumbEl.onerror = null;
    eggYoutubeThumbEl.src = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
  };
}

function resetEggMediaDialog() {
  eggYoutubeCardEl.removeAttribute("href");
  eggYoutubeThumbEl.removeAttribute("src");
  eggYoutubeLabelEl.textContent = "YouTube에서 보기";
  eggYoutubeWrapEl.hidden = true;
  eggPreviewEl.src = "";
  eggPreviewEl.title = "미리보기";
  eggPreviewWrapEl.hidden = true;
  eggPreviewLabelEl.textContent = "";
  eggExternalLinkEl.removeAttribute("href");
}

async function showYoutubeEgg(youtubeId) {
  resetEggMediaDialog();
  const id = youtubeVideoId(youtubeId);
  const watchUrl = youtubeWatchUrl(id);
  eggYoutubeWrapEl.hidden = false;
  eggYoutubeCardEl.href = watchUrl;
  setYoutubeThumb(id);

  await showModalDialog(eggMediaDialogEl);
  resetEggMediaDialog();
}

async function showEasterEgg(egg, onDone) {
  if (egg.image) {
    eggImageEl.src = egg.image;
    eggImageEl.alt = egg.imageAlt || "";
    eggImageEl.style.display = "";
    eggImageEl.onerror = () => {
      eggImageEl.style.display = "none";
    };
    await showModalDialog(eggImageDialogEl);
    eggImageEl.removeAttribute("src");
  }

  if (egg.youtube) {
    await showYoutubeEgg(egg.youtube);
  } else if (egg.link) {
    resetEggMediaDialog();
    eggPreviewWrapEl.hidden = false;
    eggPreviewEl.title = egg.link.label || "미리보기";
    eggPreviewEl.src = egg.link.url;
    eggPreviewLabelEl.textContent = egg.link.label || "";
    eggExternalLinkEl.href = egg.link.url;
    await showModalDialog(eggMediaDialogEl);
    resetEggMediaDialog();
  }

  onDone();
}

function openQuestionDialog(i) {
  activeIndex = i;
  const x = i % SIZE;
  const y = (i / SIZE) | 0;
  const q = questionForIndex(i, x, y, SIZE);
  renderQuestion(q);
  if (typeof dialogEl.showModal === "function") dialogEl.showModal();
  else {
    const r = confirm(
      `${q.en}\n${q.ko}\n\nOK = YES (white)\nCancel = NO (black)`
    );
    if (r !== null) {
      setCell(i, r ? 1 : 0);
      afterAnswer();
    }
  }
}

function questionForIndex(i, x, y, size) {
  const q = QUESTIONS[i];
  if (!q) throw new Error(`Missing question for cell ${i}`);
  return {
    en: q.en,
    ko: q.ko,
    meta: `cell ${i + 1}/${size * size}, x=${x + 1}, y=${y + 1}`,
  };
}

const state = new Int8Array(TOTAL_CELLS);
state.fill(-1);

const cellEls = [];
let activeIndex = 0;
let solved = false;

function setCell(i, v) {
  state[i] = v;
  const el = cellEls[i];
  if (!el) return;
  el.classList.remove("unanswered", "yes", "no");
  if (v === 1) el.classList.add("yes");
  else if (v === 0) el.classList.add("no");
}

function renderQuestion(q) {
  qEnEl.textContent = q.en;
  qKoEl.textContent = q.ko;
  qMetaEl.textContent = q.meta;
}

function isSolved() {
  for (let i = 0; i < TOTAL_CELLS; i++) {
    if (state[i] === -1) return false;
    if (state[i] !== TARGET[i]) return false;
  }
  return true;
}

function onSolved() {
  if (solved) return;
  solved = true;
  gridEl.classList.add("solved");
  gridEl.setAttribute("aria-label", "QR complete — scannable");
  if (typeof completeDialogEl.showModal === "function") completeDialogEl.showModal();
}

function afterAnswer() {
  if (isSolved()) onSolved();
}

function openQuestion(i) {
  if (solved) return;
  addBloodFromStab(i);

  const egg = cellEasterEgg.get(i);
  if (egg) {
    showEasterEgg(egg, () => openQuestionDialog(i));
    return;
  }

  openQuestionDialog(i);
}

function boot() {
  gridEl.style.gridTemplateColumns = `repeat(${SIZE}, var(--cell))`;
  const cell = SIZE >= 41 ? 7 : SIZE >= 33 ? 8 : SIZE >= 29 ? 9 : SIZE >= 25 ? 10 : 12;
  gridEl.style.setProperty("--cell", `${cell}px`);

  gridEl.innerHTML = "";
  cellEls.length = 0;

  for (let i = 0; i < TOTAL_CELLS; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cell unanswered";
    btn.setAttribute("aria-label", `cell ${i + 1}, unanswered`);
    btn.addEventListener("click", () => openQuestion(i));
    cellEls.push(btn);
    gridEl.appendChild(btn);
  }

  resizeBloodCanvas();
}

window.addEventListener("resize", resizeBloodCanvas);

btnYes.addEventListener("click", () => {
  setCell(activeIndex, 1);
  dialogEl.close("yes");
  afterAnswer();
});
btnNo.addEventListener("click", () => {
  setCell(activeIndex, 0);
  dialogEl.close("no");
  afterAnswer();
});
btnCancel.addEventListener("click", () => {
  dialogEl.close("cancel");
});

boot();
