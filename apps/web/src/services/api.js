import { supabase } from './supabaseClient';

// prefer an environment variable so we can change hosts between dev/staging
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// helper that automatically attaches the current supabase access token
export async function apiFetch(path, options = {}) {
  // Make sure session is refreshed if needed
  const { data: { session } } = await supabase.auth.getSession();
  
  const token = session?.access_token;
  console.log(`[apiFetch] ${options.method || 'GET'} ${path}`, {
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
    sessionExpires: session?.expires_at
  });

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  
  if (!res.ok) {
    const contentType = res.headers.get('content-type');
    const body = contentType?.includes('application/json') ? await res.json() : await res.text();
    console.error(`[apiFetch] Error: ${res.status}`, body);
  }
  
  return res;
}

export const checkHealth = async () => {
  const response = await apiFetch(`/health`);
  return response.json();
};