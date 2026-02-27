import { supabase } from './supabaseClient';

// prefer an environment variable so we can change hosts between dev/staging
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// helper that automatically attaches the current supabase access token
export async function apiFetch(path, options = {}) {
  const session = await supabase.auth.getSession();
  const headers = {
    ...(options.headers || {}),
    ...(session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : {}),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  return res;
}

export const checkHealth = async () => {
  const response = await apiFetch(`/health`);
  return response.json();
};