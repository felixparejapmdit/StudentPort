import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { JsonRepository } from './repositories/JsonRepository.js';
import { ProjectManager } from './services/ProjectManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Repositories
const deploymentsRepo = new JsonRepository(path.join(__dirname, 'data', 'deployments.json'));
const teachersRepo = new JsonRepository(path.join(__dirname, 'data', 'teachers.json'));
const studentsRepo = new JsonRepository(path.join(__dirname, 'data', 'students.json'));

// Services
const projectManager = new ProjectManager(deploymentsRepo);

// ── Multer Configuration ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ── API Routes ───────────────────────────────────────────────────────────────

// ── Deployments ─────────────────────────────────────────────────────────────
app.get('/api/deployments', async (req, res) => {
  try { res.json(await projectManager.getAllDeployments()); } 
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/deployments/:id', async (req, res) => {
  try {
    const d = await projectManager.getDeploymentById(req.params.id);
    if (!d) return res.status(404).json({ error: 'Not found' });
    res.json(d);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/deployments', async (req, res) => {
  try { res.status(201).json(await projectManager.createDeployment(req.body)); } 
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/deployments/:id', async (req, res) => {
  try { res.json(await projectManager.updateDeployment(req.params.id, req.body)); } 
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/deployments/:id', async (req, res) => {
  try {
    await projectManager.deleteDeployment(req.params.id);
    res.status(204).send();
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Reviews & Uploads ───────────────────────────────────────────────────────
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

app.post('/api/deployments/:id/reviews', async (req, res) => {
  try {
    const project = await projectManager.addReview(req.params.id, req.body);
    if (!project) return res.status(404).json({ error: 'Not found' });
    res.status(201).json(project);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/deployments/:id/reviews/:reviewId', async (req, res) => {
  try {
    const project = await projectManager.updateReview(req.params.id, req.params.reviewId, req.body.comment);
    if (!project) return res.status(404).json({ error: 'Not found' });
    res.json(project);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/deployments/:id/reviews/:reviewId/status', async (req, res) => {
  try {
    const project = await projectManager.updateReviewStatus(req.params.id, req.params.reviewId, req.body.status);
    if (!project) return res.status(404).json({ error: 'Not found' });
    res.json(project);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/deployments/:id/reviews/:reviewId/replies', async (req, res) => {
  try {
    const project = await projectManager.addReply(req.params.id, req.params.reviewId, req.body);
    if (!project) return res.status(404).json({ error: 'Not found' });
    res.status(201).json(project);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/deployments/:id/reviews/:reviewId', async (req, res) => {
  try {
    const project = await projectManager.deleteReview(req.params.id, req.params.reviewId);
    if (!project) return res.status(404).json({ error: 'Not found' });
    res.json(project);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Teachers ─────────────────────────────────────────────────────────────────
app.get('/api/teachers', async (req, res) => {
  try { res.json(await teachersRepo.getAll()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Students ─────────────────────────────────────────────────────────────────
app.get('/api/students', async (req, res) => {
  try { res.json(await studentsRepo.getAll()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
