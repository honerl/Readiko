const API_URL = "http://localhost:8000";

export const checkHealth = async () => {
  const response = await fetch(`${API_URL}/health`);
  return response.json();
};