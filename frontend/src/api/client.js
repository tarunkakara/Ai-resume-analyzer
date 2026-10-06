// API Client Wrapper for FastAPI backend endpoints

const API_BASE = ""; // Relative path works automatically for Vite proxy and single-service FastAPI deployment

export function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
}

export async function request(endpoint, options = {}) {
  const headers = {
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let errorMsg = "Request failed";
    if (typeof data.detail === "string") {
      errorMsg = data.detail;
    } else if (Array.isArray(data.detail) && data.detail.length > 0) {
      const firstErr = data.detail[0];
      errorMsg = typeof firstErr === "string" ? firstErr : (firstErr.msg || JSON.stringify(firstErr));
      errorMsg = errorMsg.replace(/^Value error,\s*/i, "");
    } else if (data.detail && typeof data.detail === "object") {
      errorMsg = data.detail.msg || JSON.stringify(data.detail);
    }
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  register: (payload) => request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }),
  
  login: (payload) => request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }),

  getMe: () => request("/api/auth/me"),

  // Jobs
  getJobs: () => request("/api/jobs"),
  createJob: (payload) => request("/api/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }),

  // Student Analyze & Optimize
  analyzeResume: (formData) => request("/api/student/analyze", {
    method: "POST",
    body: formData
  }),

  optimizeResume: (analysisId) => {
    const formData = new FormData();
    formData.append("analysis_id", analysisId);
    return request("/api/student/optimize-resume", {
      method: "POST",
      body: formData
    });
  },

  getMyAnalyses: () => request("/api/student/my-analyses"),

  // Recruiter
  bulkUploadResumes: (jdId, files) => {
    const formData = new FormData();
    formData.append("job_description_id", jdId);
    files.forEach(f => formData.append("files", f));
    return request("/api/recruiter/bulk-upload", {
      method: "POST",
      body: formData
    });
  },

  getCandidateRankings: (jdId) => request(`/api/recruiter/rankings/${jdId}`),
  getBatchAnalytics: (jdId) => request(`/api/recruiter/analytics/${jdId}`),

  // Admin
  getAdminStats: () => request("/api/admin/stats")
};
