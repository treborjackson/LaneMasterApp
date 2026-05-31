const BASE = '/api';

function getHeaders(token: string | null) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiRegister(email: string, password: string, name?: string) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function apiGetGames(token: string) {
  const res = await fetch(`${BASE}/games`, { headers: getHeaders(token) });
  if (!res.ok) throw new Error('Failed to load games');
  return res.json();
}

export async function apiSaveGame(token: string, game: unknown) {
  const res = await fetch(`${BASE}/games`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(game),
  });
  if (!res.ok) throw new Error('Failed to save game');
  return res.json();
}

export async function apiDeleteGame(token: string, id: string) {
  const res = await fetch(`${BASE}/games/${id}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to delete game');
  return res.json();
}

export async function apiGetPreferences(token: string) {
  const res = await fetch(`${BASE}/preferences`, { headers: getHeaders(token) });
  if (!res.ok) return null;
  return res.json();
}

export async function apiSavePreferences(token: string, prefs: unknown) {
  const res = await fetch(`${BASE}/preferences`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(prefs),
  });
  if (!res.ok) throw new Error('Failed to save preferences');
  return res.json();
}

export async function apiCoachMessage(token: string, payload: unknown) {
  const res = await fetch(`${BASE}/coach`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Coach API error');
  return res.json();
}

export async function apiAnalyzeForm(token: string, payload: unknown) {
  const res = await fetch(`${BASE}/analyze-form`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Analysis API error');
  return res.json();
}
