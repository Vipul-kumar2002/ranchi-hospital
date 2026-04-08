// This variable automatically picks the Render URL if it exists,
// otherwise it falls back to your local server.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

// Optional: Log it once to your browser console so you can verify the connection
console.log("🏥 Ranchi Node connected to:", API_BASE_URL);
