// Leonida Nights — editor wiring. Owns the app state, the control panel,
// photo uploads, smart crop, cast editing and the three-size PNG export.
import {
  LAYOUTS, GRADES, SCENES, layoutById, gradeById,
  drawCover, smartCropFocus, buildSceneSources,
} from "./cover.js";

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const SIZES = [
  { id: "wide", label: "1920 × 1080", w: 1920, h: 1080 },
  { id: "square", label: "1080 × 1080", w: 1080, h: 1080 },
  { id: "tall", label: "1080 × 1350", w: 1080, h: 1350 },
];

// --------------------------------------------------------------------- state
const state = {
  layout: "hero2",
  grade: "sunset",
  title: "LEONIDA",
  subtitle: "VICE NIGHTS",
  caption: "One city. One night. No way back.",
  callout: "Includes the heist",
  showBilling: true,
  showSeal: true,
  showCallout: true,
  panels: [
    { scene: 0, source: null, zoom: 1, ox: 0, oy: 0, focusX: null, focusY: null, smart: true },
    { scene: 1, source: null, zoom: 1, ox: 0, oy: 0, focusX: null, focusY: null, smart: true },
    { scene: 2, source: null, zoom: 1, ox: 0, oy: 0, focusX: null, focusY: null, smart: true },
    { scene: 3, source: null, zoom: 1, ox: 0, oy: 0, focusX: null, focusY: null, smart: true },
  ],
  cast: [
    { name: "Lucia", role: "The Driver" },
    { name: "Marco", role: "The Fixer" },
  ],
  sceneSources: [],
};

let selectedPanel = 0;
let previewCanvas = null;

function currentLayout() {
  return layoutById(state.layout);
}

function render() {
  if (!previewCanvas) return;
  previewCanvas.width = 1280;
  previewCanvas.height = 720;
  const ctx = previewCanvas.getContext("2d");
  drawCover(ctx, 1280, 720, state);
}

// ------------------------------------------------------------- photo upload
function loadPhotoFile(file, panelIndex, applyToAll) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const targets = applyToAll ? state.panels.map((_, i) => i) : [panelIndex];
        for (const i of targets) {
          const p = state.panels[i];
          p.source = img;
          p.zoom = 1;
          p.ox = 0;
          p.oy = 0;
          if (p.smart) {
            const f = smartCropFocus(img);
            p.focusX = f.x;
            p.focusY = f.y;
          } else {
            p.focusX = 0.5;
            p.focusY = 0.4;
          }
        }
        render();
        resolve(true);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function applySmartCrop(panelIndex) {
  const p = state.panels[panelIndex];
  const source = p.source || state.sceneSources[p.scene];
  if (!source) return;
  const f = smartCropFocus(source);
  p.focusX = f.x;
  p.focusY = f.y;
  p.smart = true;
  render();
}

// ------------------------------------------------------------ panel controls
function buildPanelTabs() {
  const wrap = $("#panelTabs");
  wrap.innerHTML = "";
  const n = currentLayout().panels.length;
  for (let i = 0; i < n; i++) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tab" + (i === selectedPanel ? " active" : "");
    b.textContent = `Panel ${i + 1}`;
    b.addEventListener("click", () => {
      selectedPanel = i;
      buildPanelTabs();
      buildPanelEditor();
    });
    wrap.appendChild(b);
  }
}

function buildPanelEditor() {
  const p = state.panels[selectedPanel];
  const ed = $("#panelEditor");
  ed.innerHTML = "";
  const sceneLabel = document.createElement("label");
  sceneLabel.textContent = "Sample scene";
  const sceneSel = document.createElement("select");
  sceneSel.id = "sceneSel";
  for (const s of SCENES) {
    const o = document.createElement("option");
    o.value = String(s.id);
    o.textContent = s.name;
    if (s.id === p.scene) o.selected = true;
    sceneSel.appendChild(o);
  }
  sceneSel.addEventListener("change", () => {
    p.scene = Number(sceneSel.value);
    p.source = null;
    render();
  });
  ed.appendChild(sceneLabel);
  ed.appendChild(sceneSel);

  const upLabel = document.createElement("label");
  upLabel.textContent = "Your photo";
  const up = document.createElement("input");
  up.type = "file";
  up.accept = "image/*";
  up.addEventListener("change", () => {
    if (up.files && up.files[0]) loadPhotoFile(up.files[0], selectedPanel, false);
  });
  ed.appendChild(upLabel);
  ed.appendChild(up);

  const allBtn = document.createElement("button");
  allBtn.type = "button";
  allBtn.className = "ghost";
  allBtn.textContent = "Fill all panels with one photo";
  allBtn.addEventListener("click", () => {
    const pick = document.createElement("input");
    pick.type = "file";
    pick.accept = "image/*";
    pick.addEventListener("change", () => {
      if (pick.files && pick.files[0]) loadPhotoFile(pick.files[0], selectedPanel, true);
    });
    pick.click();
  });
  ed.appendChild(allBtn);

  const mkSlider = (label, min, max, step, get, set) => {
    const lab = document.createElement("label");
    lab.textContent = label;
    const s = document.createElement("input");
    s.type = "range";
    s.min = String(min);
    s.max = String(max);
    s.step = String(step);
    s.value = String(get());
    s.addEventListener("input", () => { set(Number(s.value)); render(); });
    ed.appendChild(lab);
    ed.appendChild(s);
  };
  mkSlider("Zoom", 1, 2.5, 0.05, () => p.zoom, (v) => { p.zoom = v; });
  mkSlider("Offset X", -200, 200, 1, () => p.ox, (v) => { p.ox = v; });
  mkSlider("Offset Y", -200, 200, 1, () => p.oy, (v) => { p.oy = v; });

  const smartRow = document.createElement("label");
  smartRow.className = "check";
  const smartBox = document.createElement("input");
  smartBox.type = "checkbox";
  smartBox.checked = !!p.smart;
  smartBox.addEventListener("change", () => {
    p.smart = smartBox.checked;
    if (p.smart) applySmartCrop(selectedPanel);
  });
  smartRow.appendChild(smartBox);
  smartRow.appendChild(document.createTextNode(" Smart crop (detail-aware auto-centre)"));
  ed.appendChild(smartRow);

  const reBtn = document.createElement("button");
  reBtn.type = "button";
  reBtn.className = "ghost";
  reBtn.textContent = "Re-centre on the subject";
  reBtn.addEventListener("click", () => applySmartCrop(selectedPanel));
  ed.appendChild(reBtn);

  const hint = document.createElement("p");
  hint.className = "hint";
  hint.textContent = "Tip: click the preview to move this panel's focus point.";
  ed.appendChild(hint);
}

// ----------------------------------------------------- layout + grade picks
function buildPickers() {
  const lay = $("#layoutPicker");
  lay.innerHTML = "";
  for (const l of LAYOUTS) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip" + (l.id === state.layout ? " active" : "");
    b.textContent = l.name;
    b.addEventListener("click", () => {
      state.layout = l.id;
      if (selectedPanel >= l.panels.length) selectedPanel = 0;
      buildPickers();
      buildPanelTabs();
      buildPanelEditor();
      render();
    });
    lay.appendChild(b);
  }
  const gr = $("#gradePicker");
  gr.innerHTML = "";
  for (const g of GRADES) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip grade" + (g.id === state.grade ? " active" : "");
    b.textContent = g.name;
    b.style.setProperty("--sw", g.bot);
    b.addEventListener("click", () => {
      state.grade = g.id;
      buildPickers();
      render();
    });
    gr.appendChild(b);
  }
}

// ------------------------------------------------------------ caption + cast
function buildTextEditors() {
  const bind = (id, key) => {
    const el = $(id);
    el.value = state[key];
    el.addEventListener("input", () => {
      state[key] = el.value;
      render();
    });
  };
  bind("#titleInput", "title");
  bind("#subtitleInput", "subtitle");
  bind("#captionInput", "caption");
  bind("#calloutInput", "callout");

  const castWrap = $("#castEditor");
  const rebuildCast = () => {
    castWrap.innerHTML = "";
    state.cast.forEach((member, i) => {
      const row = document.createElement("div");
      row.className = "cast-row";
      const name = document.createElement("input");
      name.value = member.name;
      name.placeholder = "Name";
      name.addEventListener("input", () => { member.name = name.value; render(); });
      const role = document.createElement("input");
      role.value = member.role;
      role.placeholder = "Role";
      role.addEventListener("input", () => { member.role = role.value; render(); });
      const del = document.createElement("button");
      del.type = "button";
      del.className = "ghost small";
      del.textContent = "Remove";
      del.addEventListener("click", () => {
        state.cast.splice(i, 1);
        rebuildCast();
        render();
      });
      row.appendChild(name);
      row.appendChild(role);
      row.appendChild(del);
      castWrap.appendChild(row);
    });
    const add = document.createElement("button");
    add.type = "button";
    add.className = "ghost";
    add.textContent = "+ Add cast member";
    add.addEventListener("click", () => {
      if (state.cast.length < 4) {
        state.cast.push({ name: "New Face", role: "The Wildcard" });
        rebuildCast();
        render();
      }
    });
    castWrap.appendChild(add);
  };
  rebuildCast();

  const toggle = (id, key) => {
    const el = $(id);
    el.checked = !!state[key];
    el.addEventListener("change", () => {
      state[key] = el.checked;
      render();
    });
  };
  toggle("#billingToggle", "showBilling");
  toggle("#sealToggle", "showSeal");
  toggle("#calloutToggle", "showCallout");
}

// -------------------------------------------------------------------- export
function renderSize(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  drawCover(c.getContext("2d"), w, h, state);
  return c;
}

function download(canvas, name) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }, "image/png");
}

async function exportAll() {
  const out = {};
  for (const s of SIZES) {
    const c = renderSize(s.w, s.h);
    download(c, `leonida-nights-${s.id}.png`);
    out[s.id] = c.toDataURL("image/png");
  }
  return out;
}

// ------------------------------------------------------- preview click focus
function bindPreviewClick() {
  previewCanvas.addEventListener("click", (ev) => {
    const r = previewCanvas.getBoundingClientRect();
    const px = ((ev.clientX - r.left) / r.width) * 1280;
    const py = ((ev.clientY - r.top) / r.height) * 720;
    const layout = currentLayout();
    const p = state.panels[selectedPanel];
    const rect = layout.panels[selectedPanel];
    if (!rect) return;
    const [fx, fy, fw, fh] = rect;
    const rx = fx * 1280, ry = fy * 720, rw = fw * 1280, rh = fh * 720;
    if (px >= rx && px <= rx + rw && py >= ry && py <= ry + rh) {
      p.focusX = (px - rx) / rw;
      p.focusY = (py - ry) / rh;
      p.smart = false;
      const box = $("#smartToggleNote");
      if (box) box.textContent = "Focus moved by hand — smart crop off for this panel.";
      buildPanelEditor();
      render();
    }
  });
}

// ---------------------------------------------------------------------- init
function init() {
  previewCanvas = $("#preview");
  state.sceneSources = buildSceneSources(640);
  buildPickers();
  buildPanelTabs();
  buildPanelEditor();
  buildTextEditors();
  bindPreviewClick();
  $("#exportBtn").addEventListener("click", exportAll);
  render();
}

window.__studio = { state, render, exportAll, renderSize, SIZES };
init();
