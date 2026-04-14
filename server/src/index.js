import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { JsonRepository } from "./repositories/JsonRepository.js";
import { ProjectManager } from "./services/ProjectManager.js";
import {
  fetchTeachers,
  fetchStudents,
  fetchProjects,
  enrichDeployment,
  enrichDeployments,
} from "./services/ExternalApiService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Repositories (deployments.json only)
const deploymentsRepo = new JsonRepository(
  path.join(__dirname, "data", "deployments.json"),
);

// Services
const projectManager = new ProjectManager(deploymentsRepo);

// ── Multer Configuration ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "uploads")),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ── API Routes ───────────────────────────────────────────────────────────────

// ── Deployments ─────────────────────────────────────────────────────────────
app.get("/api/deployments", async (req, res) => {
  try {
    const raw = await projectManager.getAllDeployments();
    const enriched = await enrichDeployments(raw);
    res.json(enriched);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/deployments/:id", async (req, res) => {
  try {
    const d = await projectManager.getDeploymentById(req.params.id);
    if (!d) return res.status(404).json({ error: "Not found" });
    res.json(await enrichDeployment(d));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/deployments", async (req, res) => {
  try {
    // Accept both ID-based and legacy name-based payloads
    const raw = await projectManager.createDeployment(req.body);
    res.status(201).json(await enrichDeployment(raw));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/deployments/:id", async (req, res) => {
  try {
    const raw = await projectManager.updateDeployment(req.params.id, req.body);
    if (!raw) return res.status(404).json({ error: "Not found" });
    res.json(await enrichDeployment(raw));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/deployments/:id", async (req, res) => {
  try {
    await projectManager.deleteDeployment(req.params.id);
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Reviews & Uploads ───────────────────────────────────────────────────────
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ url: `/uploads/${req.file.filename}` });
});

app.post("/api/deployments/:id/reviews", async (req, res) => {
  try {
    const project = await projectManager.addReview(req.params.id, req.body);
    if (!project) return res.status(404).json({ error: "Not found" });
    res.status(201).json(await enrichDeployment(project));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/deployments/:id/reviews/:reviewId", async (req, res) => {
  try {
    const project = await projectManager.updateReview(
      req.params.id,
      req.params.reviewId,
      req.body.comment,
    );
    if (!project) return res.status(404).json({ error: "Not found" });
    res.json(await enrichDeployment(project));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch("/api/deployments/:id/reviews/:reviewId/status", async (req, res) => {
  try {
    const project = await projectManager.updateReviewStatus(
      req.params.id,
      req.params.reviewId,
      req.body.status,
    );
    if (!project) return res.status(404).json({ error: "Not found" });
    res.json(await enrichDeployment(project));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/deployments/:id/reviews/:reviewId/replies", async (req, res) => {
  try {
    const project = await projectManager.addReply(
      req.params.id,
      req.params.reviewId,
      req.body,
    );
    if (!project) return res.status(404).json({ error: "Not found" });
    res.status(201).json(await enrichDeployment(project));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/deployments/:id/reviews/:reviewId", async (req, res) => {
  try {
    const project = await projectManager.deleteReview(
      req.params.id,
      req.params.reviewId,
    );
    if (!project) return res.status(404).json({ error: "Not found" });
    res.json(await enrichDeployment(project));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Teachers (proxied from external API) ────────────────────────────────────
app.get("/api/teachers", async (req, res) => {
  try {
    res.json(await fetchTeachers());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Students (proxied from external API) ────────────────────────────────────
app.get("/api/students", async (req, res) => {
  try {
    res.json(await fetchStudents());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Projects (proxied from external API) ────────────────────────────────────
app.get("/api/projects", async (req, res) => {
  try {
    res.json(await fetchProjects());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(
    `External API: ${process.env.EXTERNAL_API_URL || "http://172.18.162.217:5000/api/items"}`,
  );
});
