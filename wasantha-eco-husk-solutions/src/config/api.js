const LOCAL_API_BASE_URL = "http://localhost:8081/api";

// REACT_APP_API_URL must include /api. Keeping that boundary here prevents
// callers from accidentally constructing /api/api URLs.
const API_BASE_URL = (process.env.REACT_APP_API_URL || LOCAL_API_BASE_URL).replace(
  /\/+$/,
  ""
);

export const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api$/, "");

export function assetUrl(path) {
  if (!path) return path;
  if (/^(?:blob:|data:)/i.test(path)) return path;

  // Preserve third-party URLs, but repair URLs saved by earlier local builds.
  if (/^https?:\/\//i.test(path)) {
    return /^(?:https?:\/\/localhost(?::\d+)?|https?:\/\/127\.0\.0\.1(?::\d+)?)(?:\/wasanthaecohusksolution\/backend)?\//i.test(path)
      ? `${BACKEND_ORIGIN}/${path.replace(/^https?:\/\/[^/]+(?:\/wasanthaecohusksolution\/backend)?\/?/i, "")}`
      : path;
  }

  return `${BACKEND_ORIGIN}/${String(path).replace(/^\/+/, "")}`;
}

export default API_BASE_URL;
