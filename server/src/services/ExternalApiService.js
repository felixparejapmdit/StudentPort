/**
 * Fetches teacher, student, and project data from the configured external API.
 * If the external service is unavailable, local fallback JSON is used.
 * All lookups are cached per-request via a simple in-memory Map with a short TTL.
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const EXTERNAL_API =
  process.env.EXTERNAL_API_URL || "http://host.docker.internal:5000/api/items";
const ENABLE_LOCAL_FALLBACK = process.env.ALLOW_LOCAL_FALLBACK === "true";
const CACHE_TTL_MS = 30_000; // 30s cache to avoid hammering the external API
const cache = new Map(); // key → { data, expires }

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_DATA_DIR = path.join(__dirname, "../data");

async function readLocalData(fileName) {
  try {
    const raw = await fs.readFile(path.join(LOCAL_DATA_DIR, fileName), "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
}

async function fetchWithCache(url) {
  const now = Date.now();
  if (cache.has(url) && cache.get(url).expires > now) {
    return cache.get(url).data;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`External API error: ${res.status} ${url}`);
  const data = await res.json();
  cache.set(url, { data, expires: now + CACHE_TTL_MS });
  return data;
}

function normalizeData(data) {
  return Array.isArray(data) ? data : (data.data ?? []);
}

async function fetchExternal(endpoint, fallbackFile) {
  try {
    const result = await fetchWithCache(`${EXTERNAL_API}/${endpoint}`);
    return normalizeData(result);
  } catch (error) {
    if (ENABLE_LOCAL_FALLBACK) {
      console.warn(
        `External API unavailable for ${endpoint}, falling back to local ${fallbackFile}:`,
        error.message,
      );
      return await readLocalData(fallbackFile);
    }

    console.error(`External API unavailable for ${endpoint}:`, error.message);
    throw new Error(`Failed to load external ${endpoint}`);
  }
}

function filterProductionStudents(students) {
  if (!Array.isArray(students)) return [];
  return students.filter((student) => {
    if (student == null || typeof student !== "object") return false;
    if (Object.prototype.hasOwnProperty.call(student, "student_type")) {
      return String(student.student_type).toLowerCase() === "production";
    }
    return true;
  });
}

export async function fetchTeachers() {
  return await fetchExternal("teachers", "teachers.json");
}

export async function fetchStudents() {
  const students = await fetchExternal("students", "students.json");
  return filterProductionStudents(students);
}

export async function fetchProjects() {
  return await fetchExternal("projects", "projects.json");
}

export async function getTeacherById(id) {
  const teachers = await fetchTeachers();
  return teachers.find((t) => String(t.id) === String(id)) ?? null;
}

export async function getStudentById(id) {
  const students = await fetchStudents();
  return students.find((s) => String(s.id) === String(id)) ?? null;
}

export async function getProjectById(id) {
  const projects = await fetchProjects();
  return projects.find((p) => String(p.id) === String(id)) ?? null;
}

/**
 * Enriches a raw deployment (with IDs) with resolved name/info fields
 * so clients continue receiving { projectName, studentName, mentorName }.
 */
export async function enrichDeployment(deployment) {
  const student = await getStudentById(deployment.student_id);
  const projectId = deployment.project_id ?? student?.project_id;
  const mentorId = deployment.mentor_id ?? student?.mentor_id;

  const [project, mentor] = await Promise.all([
    getProjectById(projectId),
    getTeacherById(mentorId),
  ]);

  return {
    ...deployment,
    projectName: project?.name ?? `Project #${projectId}`,
    studentName: student?.name ?? `Student #${deployment.student_id}`,
    mentorName: mentor?.name ?? `Mentor #${mentorId}`,
    project_id: projectId,
    student_id: deployment.student_id,
    mentor_id: mentorId,
    projectStatus: project?.status ?? null,
    projectModules: project?.modules ?? [],
  };
}

export async function enrichDeployments(deployments) {
  return Promise.all(deployments.map(enrichDeployment));
}
