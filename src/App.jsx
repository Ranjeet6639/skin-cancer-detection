import { useState, useRef, useEffect } from "react";
import { CLASSES, MODELS, REFERENCES } from "./data.js";
import { predict, isDemo } from "./api.js";

const byId = Object.fromEntries(CLASSES.map((c) => [c.id, c]));

function riskOf(preds) {
  const p = Object.fromEntries(preds.map((x) => [x.id, x.prob]));
  const malignant = CLASSES.filter((c) => c.malignant).reduce((a, c) => a + (p[c.id] || 0), 0);
  // Imbalance-aware: melanoma is rare but dangerous, so it triggers the alert at a lower threshold
  if ((p.mel || 0) >= 0.2 || malignant >= 0.5) return { level: "high", text: "Suspicious – see a dermatologist soon", malignant };
  if (malignant >= 0.3) return { level: "mid", text: "Uncertain – monitor and consider a check-up", malignant };
  return { level: "low", text: "Likely benign – keep monitoring for changes", malignant };
}

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [model, setModel] = useState(MODELS[0].id);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [opacity, setOpacity] = useState(0.6);
  const [showCam, setShowCam] = useState(true);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  function choose(f) {
    if (!f) return;
    if (!/^image\/(jpeg|png|webp)$/.test(f.type)) return setError("Please upload a JPG, PNG or WEBP image.");
    if (f.size > 10 * 1024 * 1024) return setError("Image must be under 10 MB.");
    setError(""); setResult(null); setFile(f); setPreview(URL.createObjectURL(f));
  }

  async function analyze() {
    setLoading(true); setError(""); setResult(null);
    try {
      const r = await predict(file, model);
      r.predictions.sort((a, b) => b.prob - a.prob);
      setResult(r);
    } catch (e) {
      setError(e.message || "Something went wrong. Is the backend running?");
    } finally { setLoading(false); }
  }

  function reset() { setFile(null); setPreview(null); setResult(null); setError(""); }

  const risk = result && riskOf(result.predictions);
  const top = result && result.predictions[0];

  return (
    <div className="app">
      <header>
        <h1> SkinScan AI</h1>
        <p>AI-Based Skin Cancer Detection Using Deep Learning · HAM10000 · Grad-CAM explainability</p>
      </header>

      <main>
        <section className="card">
          <h2>1. Upload lesion image</h2>
          {!preview ? (
            <div
              className={"drop" + (drag ? " over" : "")}
              onClick={() => inputRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); choose(e.dataTransfer.files[0]); }}
            >
              <div className="big">⬆️</div>
              <p>Drag & drop a dermatoscopic image, or click to browse</p>
              <small>JPG / PNG / WEBP · max 10 MB</small>
            </div>
          ) : (
            <div className="imgwrap">
              <img src={preview} alt="Uploaded lesion" />
              {result && showCam && <img className="cam" src={result.gradcam} alt="Grad-CAM heatmap" style={{ opacity }} />}
            </div>
          )}
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => choose(e.target.files[0])} />

          <h2>2. Choose model</h2>
          <div className="models">
            {MODELS.map((m) => (
              <label key={m.id} className={"model" + (model === m.id ? " sel" : "")}>
                <input type="radio" name="model" checked={model === m.id} onChange={() => setModel(m.id)} />
                <b>{m.name}</b><small>{m.note}</small>
              </label>
            ))}
          </div>

          <div className="actions">
            <button className="primary" disabled={!file || loading} onClick={analyze}>
              {loading ? "Analyzing…" : "Analyze image"}
            </button>
            {file && <button onClick={reset}>Clear</button>}
          </div>
          {error && <p className="error">⚠️ {error}</p>}
        </section>

        <section className="card">
          <h2>3. Result</h2>
          {!result && !loading && <p className="muted">Upload an image and click “Analyze image” to see the prediction, confidence and Grad-CAM explanation.</p>}
          {loading && <div className="spinner" aria-label="loading" />}
          {result && (
            <>
              <div className={"risk " + risk.level}>
                <b>{risk.text}</b>
                <small>Combined malignant-class probability: {(risk.malignant * 100).toFixed(1)}%</small>
              </div>

              <h3>Top prediction</h3>
              <p className="top">{byId[top.id].name} <span>{(top.prob * 100).toFixed(1)}%</span></p>
              <p className="muted">{byId[top.id].info}</p>

              <h3>All class probabilities</h3>
              {result.predictions.map((p) => (
                <div className="bar" key={p.id}>
                  <span>{byId[p.id].name}{byId[p.id].malignant && " ⚠"}</span>
                  <div><i className={byId[p.id].malignant ? "m" : "b"} style={{ width: `${p.prob * 100}%` }} /></div>
                  <em>{(p.prob * 100).toFixed(1)}%</em>
                </div>
              ))}

              <h3>Grad-CAM explanation</h3>
              <label className="cam-ctl">
                <input type="checkbox" checked={showCam} onChange={(e) => setShowCam(e.target.checked)} /> Show heatmap
                <input type="range" min="0" max="1" step="0.05" value={opacity} onChange={(e) => setOpacity(+e.target.value)} />
              </label>
              <p className="muted">Red areas influenced the model’s decision the most.</p>
            </>
          )}
        </section>
      </main>

      <section className="card refs">
        <h2>Design basis – how the literature shaped this UI</h2>
        <table>
          <thead><tr><th>Reference</th><th>UI feature</th><th>Why</th></tr></thead>
          <tbody>
            {REFERENCES.map((r) => (
              <tr key={r.cite}><td>{r.cite}</td><td><b>{r.feature}</b></td><td>{r.why}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer>
        <br />Major Project I · Group D3 · Pimpri Chinchwad University
      </footer>
    </div>
  );
}
