// ExternalServices.js
// Centralised fetch wrapper with convertToJson() error handling

/**
 * Converts a fetch Response to JSON, throwing a structured error on failure.
 * @param {Response} response
 * @returns {Promise<Object>}
 */
export async function convertToJson(response) {
  if (!response.ok) {
    const error = new Error(`Network response error: ${response.status} ${response.statusText}`);
    error.name = "FetchError";
    error.status = response.status;
    throw error;
  }
  try {
    return await response.json();
  } catch (e) {
    const error = new Error("Failed to parse JSON response");
    error.name = "ParseError";
    throw error;
  }
}

/**
 * Shared fetch wrapper used by all API modules.
 * @param {string} url
 * @param {Object} options - fetch options
 * @returns {Promise<Object>}
 */
export async function fetchData(url, options = {}) {
  const response = await fetch(url, options);
  return convertToJson(response);
}
