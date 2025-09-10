// Local anonymous user id helper
const KEY = 'hb_user_id';

function randomHex(bytes: number) {
  const arr = new Uint8Array(bytes);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(arr);
  else for (let i = 0; i < bytes; i++) arr[i] = Math.floor(Math.random() * 256);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function getOrCreateUserId(): string {
  if (typeof localStorage === 'undefined') return randomHex(16);
  const existing = localStorage.getItem(KEY);
  if (existing) return existing;
  // Generate RFC4122-ish v4 uuid from random hex
  const hex = randomHex(16);
  const uuid = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20)}`;
  localStorage.setItem(KEY, uuid);
  return uuid;
}

