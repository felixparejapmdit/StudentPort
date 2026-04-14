const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api`;

// ── Deployments ──────────────────────────────────────────────────────────────
export const fetchDeployments = async () => {
  const res = await fetch(`${API_URL}/deployments`);
  if (!res.ok) throw new Error("Failed to fetch deployments");
  return res.json();
};

export const fetchDeploymentById = async (id) => {
  const res = await fetch(`${API_URL}/deployments/${id}`);
  if (!res.ok) throw new Error("Failed to fetch deployment");
  return res.json();
};

export const fetchProjects = async () => {
  const res = await fetch(`${API_URL}/projects`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
};

export const createDeployment = async (data) => {
  const res = await fetch(`${API_URL}/deployments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create deployment");
  return res.json();
};

export const updateDeployment = async (id, data) => {
  const res = await fetch(`${API_URL}/deployments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update deployment");
  return res.json();
};

export const deleteDeployment = async (id) => {
  const res = await fetch(`${API_URL}/deployments/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete deployment");
};

export const addReview = async (id, data) => {
  const res = await fetch(`${API_URL}/deployments/${id}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add review");
  return res.json();
};

export const updateReview = async (projectId, reviewId, comment) => {
  const res = await fetch(
    `${API_URL}/deployments/${projectId}/reviews/${reviewId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment }),
    },
  );
  if (!res.ok) throw new Error("Failed to update review");
  return res.json();
};

export const updateReviewStatus = async (projectId, reviewId, status) => {
  const res = await fetch(
    `${API_URL}/deployments/${projectId}/reviews/${reviewId}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
};

export const addReply = async (projectId, reviewId, reply) => {
  const res = await fetch(
    `${API_URL}/deployments/${projectId}/reviews/${reviewId}/replies`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reply),
    },
  );
  if (!res.ok) throw new Error("Failed to add reply");
  return res.json();
};

export const deleteReview = async (projectId, reviewId) => {
  const res = await fetch(
    `${API_URL}/deployments/${projectId}/reviews/${reviewId}`,
    {
      method: "DELETE",
    },
  );
  if (!res.ok) throw new Error("Failed to delete review");
  return res.json();
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`${API_URL.replace("/api", "")}/api/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
};

// ── Teachers ─────────────────────────────────────────────────────────────────
export const fetchTeachers = async () => {
  const res = await fetch(`${API_URL}/teachers`);
  if (!res.ok) throw new Error("Failed to fetch teachers");
  return res.json();
};

export const createTeacher = async (data) => {
  const res = await fetch(`${API_URL}/teachers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create teacher");
  return res.json();
};

export const updateTeacher = async (id, data) => {
  const res = await fetch(`${API_URL}/teachers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update teacher");
  return res.json();
};

export const deleteTeacher = async (id) => {
  const res = await fetch(`${API_URL}/teachers/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete teacher");
};

// ── Students ─────────────────────────────────────────────────────────────────
export const fetchStudents = async () => {
  const res = await fetch(`${API_URL}/students`);
  if (!res.ok) throw new Error("Failed to fetch students");
  return res.json();
};

export const createStudent = async (data) => {
  const res = await fetch(`${API_URL}/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create student");
  return res.json();
};

export const updateStudent = async (id, data) => {
  const res = await fetch(`${API_URL}/students/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update student");
  return res.json();
};

export const deleteStudent = async (id) => {
  const res = await fetch(`${API_URL}/students/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete student");
};
