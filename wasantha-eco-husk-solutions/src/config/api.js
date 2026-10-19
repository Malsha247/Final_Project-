const API_BASE_URL = (
  process.env.REACT_APP_API_URL ||
  "http://localhost:8081/api"
).replace(/\/+$/, "");

export default API_BASE_URL;