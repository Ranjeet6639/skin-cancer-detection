# SkinScan AI – Frontend (Major Project I, Group D3)
React + Vite frontend for "AI-Based Skin Cancer Detection Using Deep Learning".

## Run
    npm install
    npm run dev          # open http://localhost:5173

Runs in **demo mode** (simulated prediction + fake Grad-CAM) until a backend exists.

## Connect the backend later
Copy `.env.example` to `.env`, set `VITE_API_URL=http://localhost:8000`, and expose:

    POST /predict  (multipart: file, model)
    -> { "predictions": [{"id":"mel","prob":0.62}, ...7 HAM10000 ids...],
         "gradcam": "data:image/png;base64,..." }   # transparent heatmap, same aspect as input

Class ids: mel, bcc, akiec, nv, bkl, df, vasc. (Enable CORS on Flask/FastAPI.)
