import { CLASSES } from "./data.js";

const API = import.meta.env.VITE_API_URL;
export const isDemo = !API;

/**
 * Backend contract (Flask/FastAPI):
 *   POST {API}/predict   multipart/form-data: file (image), model (string)
 *   -> { predictions: [{ id: "mel", prob: 0.62 }, ...], gradcam: "data:image/png;base64,..." }
 */
export async function predict(file, model) {
  if (isDemo) return mockPredict(file, model);
  const fd = new FormData();
  fd.append("file", file);
  fd.append("model", model);
  const res = await fetch(`${API}/predict`, { method: "POST", body: fd });
  if (!res.ok) throw new Error(`Server error (${res.status})`);
  return res.json();
}

// ---- Demo mode: simulated output so the UI can be built/tested before the model exists ----
function seeded(seed) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

async function mockPredict(file, model) {
  await new Promise((r) => setTimeout(r, 1200));
  const seed = [...file.name + model].reduce((a, c) => a + c.charCodeAt(0), file.size);
  const rnd = seeded(seed);
  const raw = CLASSES.map((c) => Math.exp(rnd() * 3 + (c.id === "nv" ? 1.2 : 0)));
  const sum = raw.reduce((a, b) => a + b, 0);
  const predictions = CLASSES.map((c, i) => ({ id: c.id, prob: raw[i] / sum }));
  return { predictions, gradcam: fakeHeatmap(rnd) };
}

function fakeHeatmap(rnd) {
  const c = document.createElement("canvas");
  c.width = c.height = 224;
  const g = c.getContext("2d");
  [[0.5, 0.5, 70], [0.3 + rnd() * 0.4, 0.3 + rnd() * 0.4, 45]].forEach(([x, y, r]) => {
    const gr = g.createRadialGradient(x * 224, y * 224, 0, x * 224, y * 224, r);
    gr.addColorStop(0, "rgba(255,0,0,0.9)");
    gr.addColorStop(0.5, "rgba(255,220,0,0.55)");
    gr.addColorStop(1, "rgba(0,0,255,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 224, 224);
  });
  return c.toDataURL("image/png");
}
