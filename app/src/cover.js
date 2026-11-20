// Leonida Nights — cover renderer. Draws GTA-style multi-panel poster art
// on a canvas: panels, grades, lettering, cast tags, billing block, seal.
// Every scene here is procedural (drawn with canvas primitives) — no
// photographs of real people, no Rockstar artwork, no game fonts.

// ---------------------------------------------------------------- layouts
// A panel rect is [x, y, w, h] in fractions of the cover. `slant` draws the
// panel as a parallelogram leaning right; `popout` draws the hero panel
// larger than its frame so it breaks out over its neighbours.
export const LAYOUTS = [
  { id: "hero2", name: "Hero + 2", panels: [[0, 0, 0.62, 1], [0.64, 0, 0.36, 0.49], [0.64, 0.51, 0.36, 0.49]], hero: 0 },
  { id: "triple", name: "Triple", panels: [[0, 0, 0.33, 1], [0.335, 0, 0.33, 1], [0.67, 0, 0.33, 1]], hero: 1 },
  { id: "grid2", name: "Grid 2x2", panels: [[0, 0, 0.495, 0.495], [0.505, 0, 0.495, 0.495], [0, 0.505, 0.495, 0.495], [0.505, 0.505, 0.495, 0.495]], hero: 0 },
  { id: "fullbleed", name: "Full Bleed", panels: [[0, 0, 1, 1]], hero: 0 },
  { id: "popout", name: "Pop-Out Hero", panels: [[0.22, 0.06, 0.56, 0.88], [0, 0, 0.24, 1], [0.76, 0, 0.24, 1]], hero: 0, popout: true },
  { id: "slanted", name: "Slanted", panels: [[0, 0, 0.36, 1], [0.34, 0, 0.36, 1], [0.68, 0, 0.32, 1]], hero: 1, slant: 0.06 },
  { id: "strip", name: "Hero Strip", panels: [[0, 0, 1, 0.6], [0, 0.62, 0.325, 0.38], [0.3375, 0.62, 0.325, 0.38], [0.675, 0.62, 0.325, 0.38]], hero: 0 },
];

// ------------------------------------------------------------------ grades
// Each grade is a sky gradient plus a warm/cool tint washed over the art.
export const GRADES = [
  { id: "sunset", name: "Sunset", top: "#2b1055", mid: "#ff7e5f", bot: "#feb47b", tint: "rgba(255,110,60,0.16)", ink: "#ffffff", accent: "#ffd166" },
  { id: "neonnight", name: "Neon Night", top: "#0b0620", mid: "#3b0f6e", bot: "#ff2e88", tint: "rgba(120,40,255,0.20)", ink: "#ffffff", accent: "#39ffdc" },
  { id: "palmdusk", name: "Palm Dusk", top: "#1d2b53", mid: "#7e2553", bot: "#ff9e5e", tint: "rgba(255,140,80,0.14)", ink: "#fff7e6", accent: "#ffe066" },
  { id: "ink", name: "Ink", top: "#101418", mid: "#2c343c", bot: "#5a6a72", tint: "rgba(0,0,0,0.22)", ink: "#f2f2f2", accent: "#ff5a5a" },
  { id: "coralheat", name: "Coral Heat", top: "#4a0e2e", mid: "#c62f5b", bot: "#ff8c42", tint: "rgba(255,90,60,0.18)", ink: "#ffffff", accent: "#ffe66d" },
  { id: "vicegold", name: "Vice Gold", top: "#231303", mid: "#8a5a12", bot: "#f7b733", tint: "rgba(255,190,60,0.15)", ink: "#fffbe8", accent: "#fff3b0" },
  { id: "ultraviolet", name: "Ultraviolet", top: "#12002b", mid: "#5b2a86", bot: "#c86bfa", tint: "rgba(160,80,255,0.20)", ink: "#ffffff", accent: "#e0aaff" },
  { id: "noir", name: "Mono Noir", top: "#000000", mid: "#1a1a1a", bot: "#4d4d4d", tint: "rgba(255,255,255,0.06)", ink: "#ffffff", accent: "#d9d9d9" },
];

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) || GRADES[0];
}
export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) || LAYOUTS[0];
}

// ------------------------------------------------------------ sample scenes
// Procedural Vice City scenes, drawn fresh on every render. scene ids:
// 0 sunset boulevard, 1 pier, 2 palms, 3 neon street, 4 beach, 5 skyline.
export const SCENES = [
  { id: 0, name: "Sunset Boulevard" },
  { id: 1, name: "Pier" },
  { id: 2, name: "Palms" },
  { id: 3, name: "Neon Street" },
  { id: 4, name: "Beach" },
  { id: 5, name: "Skyline" },
];

function sky(ctx, w, h, g) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, g.top);
  grad.addColorStop(0.55, g.mid);
  grad.addColorStop(1, g.bot);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function sun(ctx, w, h, cx, cy, r, color) {
  const glow = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 2.4);
  glow.addColorStop(0, color);
  glow.addColorStop(1, "rgba(255,120,80,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(cx - r * 2.4, cy - r * 2.4, r * 4.8, r * 4.8);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

function palm(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, s * 0.06);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + s * 0.08, y - s * 0.55, x + s * 0.16, y - s * 0.95);
  ctx.stroke();
  const topX = x + s * 0.16, topY = y - s * 0.95;
  for (let i = 0; i < 7; i++) {
    const a = (-Math.PI * 0.85) + (i * Math.PI * 0.28);
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(
      topX + Math.cos(a) * s * 0.45, topY + Math.sin(a) * s * 0.35 - s * 0.1,
      topX + Math.cos(a) * s * 0.8, topY + Math.sin(a) * s * 0.55 + s * 0.12);
    ctx.stroke();
  }
}

function building(ctx, x, y, w, h, color, lit) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  if (lit) {
    ctx.fillStyle = "rgba(255,220,120,0.85)";
    const cols = Math.max(1, Math.floor(w / 14));
    const rows = Math.max(1, Math.floor(h / 18));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if ((r * 7 + c * 3) % 4 === 0) {
          ctx.fillRect(x + 4 + c * 14, y + 5 + r * 18, 6, 8);
        }
      }
    }
  }
}

function drawScene(ctx, w, h, sceneId, grade) {
  sky(ctx, w, h, grade);
  const R = (seed) => {
    let s = seed * 9301 + 49297;
    return () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  };
  if (sceneId === 0) {
    // Sunset boulevard: sun, skyline, road with perspective lines.
    sun(ctx, w, h, w * 0.68, h * 0.42, h * 0.13, "#fff3b0");
    ctx.fillStyle = "#1c0f2e";
    let x = 0;
    const rnd = R(11);
    while (x < w) {
      const bw = w * (0.08 + rnd() * 0.1);
      const bh = h * (0.25 + rnd() * 0.3);
      building(ctx, x, h * 0.62 - bh, bw, bh, "#1c0f2e", true);
      x += bw + 2;
    }
    ctx.fillStyle = "#12081f";
    ctx.fillRect(0, h * 0.62, w, h * 0.38);
    ctx.strokeStyle = "rgba(255,209,102,0.8)";
    ctx.lineWidth = Math.max(2, h * 0.008);
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.62);
    ctx.lineTo(w * 0.32, h);
    ctx.moveTo(w * 0.5, h * 0.62);
    ctx.lineTo(w * 0.68, h);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.setLineDash([h * 0.05, h * 0.04]);
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.64);
    ctx.lineTo(w * 0.5, h);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (sceneId === 1) {
    // Pier: sea, sun reflection, wooden pier planks.
    sun(ctx, w, h, w * 0.3, h * 0.34, h * 0.12, "#ffe9a8");
    ctx.fillStyle = "#17324a";
    ctx.fillRect(0, h * 0.55, w, h * 0.45);
    ctx.fillStyle = "rgba(255,220,140,0.5)";
    for (let i = 0; i < 8; i++) {
      const yy = h * (0.58 + i * 0.05);
      ctx.fillRect(w * (0.22 + (i % 2) * 0.06), yy, w * (0.16 - i * 0.012), 2);
    }
    ctx.fillStyle = "#3a2415";
    ctx.fillRect(0, h * 0.68, w, h * 0.1);
    ctx.fillStyle = "#5a3a22";
    for (let i = 0; i < 14; i++) ctx.fillRect(i * (w / 14), h * 0.68, 2, h * 0.1);
    ctx.fillStyle = "#2a1a0e";
    for (let i = 0; i < 6; i++) ctx.fillRect(w * (0.08 + i * 0.16), h * 0.78, w * 0.02, h * 0.22);
    palm(ctx, w * 0.86, h * 0.68, h * 0.22, "#0d1f14");
  } else if (sceneId === 2) {
    // Palms: big sky, row of palms, low wall.
    sun(ctx, w, h, w * 0.5, h * 0.3, h * 0.11, "#fff0b8");
    ctx.fillStyle = "#241533";
    ctx.fillRect(0, h * 0.78, w, h * 0.22);
    const rnd = R(23);
    for (let i = 0; i < 5; i++) {
      palm(ctx, w * (0.08 + i * 0.2), h * 0.8, h * (0.3 + rnd() * 0.16), "#0d1f14");
    }
  } else if (sceneId === 3) {
    // Neon street: buildings, neon signs, wet road reflection.
    ctx.fillStyle = "#0a0618";
    ctx.fillRect(0, 0, w, h);
    const rnd = R(37);
    const neons = ["#ff2e88", "#39ffdc", "#ffd166", "#c86bfa"];
    let x = 0;
    while (x < w) {
      const bw = w * (0.1 + rnd() * 0.08);
      const bh = h * (0.4 + rnd() * 0.35);
      building(ctx, x, h * 0.72 - bh, bw, bh, "#141024", true);
      ctx.fillStyle = neons[Math.floor(rnd() * neons.length)];
      ctx.fillRect(x + bw * 0.15, h * 0.72 - bh * 0.7, bw * 0.7, h * 0.03);
      ctx.fillRect(x + bw * 0.15, h * 0.72 - bh * 0.45, bw * 0.5, h * 0.02);
      x += bw + 3;
    }
    ctx.fillStyle = "#0d0a1a";
    ctx.fillRect(0, h * 0.72, w, h * 0.28);
    ctx.fillStyle = "rgba(255,46,136,0.25)";
    ctx.fillRect(0, h * 0.74, w, h * 0.03);
    ctx.fillStyle = "rgba(57,255,220,0.2)";
    ctx.fillRect(w * 0.4, h * 0.8, w * 0.2, h * 0.02);
  } else if (sceneId === 4) {
    // Beach: sand, sea band, umbrella, sun.
    sun(ctx, w, h, w * 0.72, h * 0.26, h * 0.12, "#fff3b0");
    ctx.fillStyle = "#1f6f8b";
    ctx.fillRect(0, h * 0.52, w, h * 0.16);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    for (let i = 0; i < 5; i++) ctx.fillRect(w * (0.05 + i * 0.19), h * (0.55 + (i % 2) * 0.05), w * 0.12, 2);
    ctx.fillStyle = "#f2d5a0";
    ctx.fillRect(0, h * 0.68, w, h * 0.32);
    ctx.strokeStyle = "#8a6d3b";
    ctx.lineWidth = Math.max(2, h * 0.006);
    ctx.beginPath();
    ctx.moveTo(w * 0.3, h * 0.68);
    ctx.lineTo(w * 0.3, h * 0.42);
    ctx.stroke();
    ctx.fillStyle = "#ff5a5a";
    ctx.beginPath();
    ctx.moveTo(w * 0.3, h * 0.42);
    ctx.quadraticCurveTo(w * 0.14, h * 0.3, w * 0.12, h * 0.44);
    ctx.quadraticCurveTo(w * 0.3, h * 0.5, w * 0.48, h * 0.44);
    ctx.quadraticCurveTo(w * 0.46, h * 0.3, w * 0.3, h * 0.42);
    ctx.fill();
    palm(ctx, w * 0.82, h * 0.72, h * 0.26, "#0d2b16");
  } else {
    // Skyline: layered towers against the grade sky.
    const rnd = R(51);
    ctx.fillStyle = "rgba(20,10,40,0.55)";
    let x = 0;
    while (x < w) {
      const bw = w * (0.09 + rnd() * 0.08);
      const bh = h * (0.3 + rnd() * 0.25);
      ctx.fillRect(x, h * 0.66 - bh, bw, bh);
      x += bw + 4;
    }
    x = 0;
    while (x < w) {
      const bw = w * (0.07 + rnd() * 0.09);
      const bh = h * (0.2 + rnd() * 0.35);
      building(ctx, x, h * 0.72 - bh, bw, bh, "#12081f", true);
      x += bw + 3;
    }
    ctx.fillStyle = "#0a0616";
    ctx.fillRect(0, h * 0.72, w, h * 0.28);
  }
}

// -------------------------------------------------------------- smart crop
// Detail-aware focus: downsample the source to a coarse grid, score each
// cell by luminance edge energy against its neighbours, and return the
// focus point (0..1) of the most detailed region, with a gentle bias to
// the upper half where a subject's face usually sits. No model, no
// network — plain canvas math, so it runs offline.
export function smartCropFocus(source, sw, sh) {
  const GW = 24, GH = 14;
  const off = document.createElement("canvas");
  off.width = GW;
  off.height = GH;
  const octx = off.getContext("2d", { willReadFrequently: true });
  octx.drawImage(source, 0, 0, GW, GH);
  let data;
  try {
    data = octx.getImageData(0, 0, GW, GH).data;
  } catch (e) {
    return { x: 0.5, y: 0.4 };
  }
  const lum = new Float32Array(GW * GH);
  for (let i = 0; i < GW * GH; i++) {
    lum[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }
  let best = 0, bestScore = -1;
  for (let y = 0; y < GH; y++) {
    for (let x = 0; x < GW; x++) {
      const i = y * GW + x;
      const dx = Math.abs(lum[i] - lum[i + (x < GW - 1 ? 1 : 0)]);
      const dy = Math.abs(lum[i] - lum[i + (y < GH - 1 ? GW : 0)]);
      const upperBias = 1 + (GH - y) / GH * 0.35;
      const score = (dx + dy) * upperBias;
      if (score > bestScore) { bestScore = score; best = i; }
    }
  }
  return { x: (best % GW + 0.5) / GW, y: (Math.floor(best / GW) + 0.5) / GH };
}

// ------------------------------------------------------------ panel drawing
// Draw one source image into a rect with cover-fit, honouring the panel's
// zoom, manual offset and smart-crop focus point.
function drawPanelImage(ctx, source, rect, panel) {
  const [rx, ry, rw, rh] = rect;
  const iw = source.naturalWidth || source.width;
  const ih = source.naturalHeight || source.height;
  if (!iw || !ih) return;
  const zoom = panel.zoom || 1;
  const scale = Math.max(rw / iw, rh / ih) * zoom;
  const dw = iw * scale, dh = ih * scale;
  const fx = panel.focusX != null ? panel.focusX : 0.5;
  const fy = panel.focusY != null ? panel.focusY : 0.4;
  const cx = rx + rw / 2 - dw * fx + (panel.ox || 0);
  const cy = ry + rh / 2 - dh * fy + (panel.oy || 0);
  ctx.drawImage(source, cx, cy, dw, dh);
}

function clipPanel(ctx, rect, slant) {
  const [x, y, w, h] = rect;
  ctx.beginPath();
  if (slant) {
    ctx.moveTo(x + w * slant, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w - w * slant, y + h);
    ctx.lineTo(x, y + h);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.closePath();
  ctx.clip();
}

// ---------------------------------------------------------------- lettering
function drawLettering(ctx, W, H, state, grade) {
  const title = (state.title || "LEONIDA").toUpperCase();
  const subtitle = (state.subtitle || "VICE NIGHTS").toUpperCase();
  const caption = state.caption || "";
  const base = Math.min(W, H);
  const tx = W * 0.045, ty = H * 0.80;
  ctx.save();
  ctx.textBaseline = "alphabetic";
  // Title: heavy condensed capitals with an accent underline slash.
  const titleSize = base * 0.115;
  ctx.font = `900 ${titleSize}px "Arial Narrow", "Helvetica Neue", Impact, sans-serif`;
  ctx.fillStyle = grade.ink;
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = titleSize * 0.12;
  ctx.shadowOffsetY = titleSize * 0.04;
  ctx.fillText(title, tx, ty);
  ctx.shadowColor = "transparent";
  ctx.fillStyle = grade.accent;
  ctx.fillRect(tx, ty + titleSize * 0.08, Math.min(W * 0.34, title.length * titleSize * 0.42), titleSize * 0.045);
  // Subtitle: wide-tracked capitals.
  const subSize = base * 0.038;
  ctx.font = `700 ${subSize}px "Arial Narrow", "Helvetica Neue", Impact, sans-serif`;
  ctx.fillStyle = grade.accent;
  const spaced = subtitle.split("").join("  ");
  ctx.fillText(spaced, tx, ty + subSize * 1.7);
  // Caption line under the subtitle.
  if (caption) {
    const capSize = base * 0.028;
    ctx.font = `400 ${capSize}px "Helvetica Neue", Arial, sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fillText(caption.slice(0, 90), tx, ty + subSize * 1.7 + capSize * 1.9);
  }
  ctx.restore();
}

function drawCastTags(ctx, W, H, state) {
  const cast = state.cast || [];
  if (!cast.length) return;
  const base = Math.min(W, H);
  const tagH = base * 0.052;
  let x = W * 0.045;
  const y = H * 0.045;
  ctx.save();
  ctx.font = `700 ${base * 0.024}px "Arial Narrow", "Helvetica Neue", Impact, sans-serif`;
  for (const member of cast.slice(0, 4)) {
    const label = `${member.name}  ·  ${member.role}`.toUpperCase();
    const w = ctx.measureText(label).width + base * 0.03;
    ctx.fillStyle = "rgba(10,6,20,0.78)";
    ctx.beginPath();
    ctx.roundRect(x, y, w, tagH, tagH / 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = Math.max(1, base * 0.002);
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(label, x + base * 0.015, y + tagH * 0.68);
    x += w + base * 0.014;
  }
  ctx.restore();
}

function drawBilling(ctx, W, H, state) {
  if (!state.showBilling) return;
  const base = Math.min(W, H);
  const lines = [
    "A LEONIDA NIGHTS PRODUCTION   ·   STARRING " + (state.cast || []).map((c) => c.name).join("   ·   "),
    "MUSIC BY THE VICE ORCHESTRA   ·   SHOT ON LEONIDA BOULEVARD   ·   LEONIDA NIGHTS 2026",
  ];
  ctx.save();
  ctx.font = `400 ${base * 0.016}px "Helvetica Neue", Arial, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.textAlign = "center";
  lines.forEach((line, i) => {
    ctx.fillText(line.slice(0, 120), W / 2, H - base * 0.028 - (lines.length - 1 - i) * base * 0.02);
  });
  ctx.restore();
}

function drawSeal(ctx, W, H, grade) {
  const base = Math.min(W, H);
  const cx = W - base * 0.075, cy = base * 0.085, r = base * 0.055;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(10,6,20,0.72)";
  ctx.fill();
  ctx.strokeStyle = grade.accent;
  ctx.lineWidth = Math.max(2, base * 0.004);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = Math.max(1, base * 0.002);
  ctx.stroke();
  // Five-point star.
  ctx.fillStyle = grade.accent;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r * 0.42 : r * 0.18;
    const px = cx + Math.cos(ang) * rr, py = cy + Math.sin(ang) * rr;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.font = `700 ${base * 0.013}px "Arial Narrow", sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText("VICE CITY", cx, cy + r * 0.68);
  ctx.restore();
}

function drawCallout(ctx, W, H, state, grade) {
  if (!state.showCallout || !state.callout) return;
  const base = Math.min(W, H);
  const text = state.callout.toUpperCase().slice(0, 40);
  ctx.save();
  ctx.translate(W * 0.06, H * 0.16);
  ctx.rotate(-0.06);
  ctx.font = `900 ${base * 0.026}px "Arial Narrow", "Helvetica Neue", Impact, sans-serif`;
  const w = ctx.measureText(text).width + base * 0.04;
  const h = base * 0.05;
  ctx.fillStyle = grade.accent;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w, 0);
  ctx.lineTo(w - base * 0.02, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#14082a";
  ctx.fillText(text, base * 0.02, h * 0.7);
  ctx.restore();
}

// ------------------------------------------------------------------ drawing
// state: { layout, grade, title, subtitle, caption, panels[], cast[],
//          showBilling, showSeal, showCallout, callout, sceneSources }
// panels[i]: { source (canvas/image or null), scene (0..5), zoom, ox, oy,
//              focusX, focusY, smart (bool) }
// sceneSources: array of offscreen canvases with the procedural scenes.
export function drawCover(ctx, W, H, state) {
  const grade = gradeById(state.grade);
  const layout = layoutById(state.layout);
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#0a0616";
  ctx.fillRect(0, 0, W, H);
  const gap = Math.max(2, Math.min(W, H) * 0.008);
  const panels = layout.panels;
  // Side panels first, hero last so a pop-out hero overlaps them.
  const order = panels.map((_, i) => i).sort((a, b) => (a === layout.hero ? 1 : 0) - (b === layout.hero ? 1 : 0));
  for (const i of order) {
    const [fx, fy, fw, fh] = panels[i];
    const rect = [fx * W + (i === 0 ? 0 : gap / 2), fy * H + (i === 0 ? 0 : gap / 2), fw * W - gap, fh * H - gap];
    const panel = state.panels[i] || {};
    const isHero = i === layout.hero;
    const pop = layout.popout && isHero;
    const drawRect = pop
      ? [rect[0] - W * 0.02, rect[1] - H * 0.03, rect[2] + W * 0.04, rect[3] + H * 0.06]
      : rect;
    ctx.save();
    if (pop) {
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = Math.min(W, H) * 0.03;
      ctx.shadowOffsetY = Math.min(W, H) * 0.012;
    }
    clipPanel(ctx, drawRect, layout.slant || 0);
    const source = panel.source || (state.sceneSources && state.sceneSources[panel.scene ?? (i % SCENES.length)]);
    if (source) {
      drawPanelImage(ctx, source, drawRect, panel);
      if (panel.source && panel.smart && panel.focusX == null) {
        const f = smartCropFocus(source);
        panel.focusX = f.x;
        panel.focusY = f.y;
      }
    } else {
      ctx.fillStyle = grade.mid;
      ctx.fillRect(drawRect[0], drawRect[1], drawRect[2], drawRect[3]);
    }
    // Grade wash + frame.
    ctx.fillStyle = grade.tint;
    ctx.fillRect(drawRect[0], drawRect[1], drawRect[2], drawRect[3]);
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = Math.max(2, Math.min(W, H) * 0.006);
    ctx.strokeRect(drawRect[0], drawRect[1], drawRect[2], drawRect[3]);
    ctx.restore();
  }
  // Poster furniture on top.
  drawLettering(ctx, W, H, state, grade);
  drawCastTags(ctx, W, H, state);
  if (state.showSeal) drawSeal(ctx, W, H, grade);
  drawCallout(ctx, W, H, state, grade);
  drawBilling(ctx, W, H, state);
}

// Render into a canvas element at the given pixel size.
export function renderCover(canvas, W, H, state) {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  drawCover(ctx, W, H, state);
  return canvas;
}

// Build the procedural scene canvases once per page load.
export function buildSceneSources(size) {
  const grade = GRADES[0];
  return SCENES.map((scene) => {
    const c = document.createElement("canvas");
    c.width = size;
    c.height = Math.round(size * 0.66);
    drawScene(c.getContext("2d"), c.width, c.height, scene.id, grade);
    return c;
  });
}
