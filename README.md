# Integral — Engineering Mathematics MVP

A Vite + React demo for an engineering-math learning product. It demonstrates a lesson that connects a first-order differential equation to chemical reactor kinetics, includes a visual explanation, practice feedback, and a simple mastery dashboard.

## Run locally

1. Install Node.js (LTS) if it is not installed.
2. Open this folder in a terminal.
3. Run:

```bash
npm install
npm run dev
```

4. Open the local URL printed by Vite (usually `http://localhost:5173`).

## Deploy to Vercel

1. Push this project to your team's GitHub repository.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Vercel should detect Vite automatically. Build command: `npm run build`; output directory: `dist`.
4. Deploy and share the resulting URL.

## Important demo limitations

This is a front-end prototype. It does **not** currently call a live AI model, parse the contents of uploaded files, or save progress to a database. The file picker demonstrates selecting a course resource locally; lesson content and feedback are sample demo content. Do not present those features as live AI functionality. A real AI integration needs a server-side API route and a private API key stored in Vercel environment variables.

## Demo answer

For `k = 0.2 min⁻¹` and `t = 5 min`, the model gives `C_A/C_A0 = e^(-kt) = e^-1 ≈ 0.368`. Enter `0.368` (or `0.37`).
