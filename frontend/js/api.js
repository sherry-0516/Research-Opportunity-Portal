// =====================================================================
// API Client Service
// Encapsulates all REST API interactions using vanilla fetch()
// =====================================================================

const API_BASE_URL = '/api/opportunities';

/**
 * Helper to process Fetch API responses uniformly
 */
async function handleResponse(response) {
  let json;
  try {
    json = await response.json();
  } catch (err) {
    // Fallback if response is non-JSON
    throw new Error(`Server returned an invalid response (HTTP ${response.status})`);
  }

  if (!response.ok) {
    const error = new Error(json.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.errors = json.errors || [];
    error.data = json;
    throw error;
  }

  return json;
}

const OpportunityAPI = {
  /**
   * Fetch all research opportunities with optional search & status filters
   */
  async getAll({ search = '', status = '' } = {}) {
    const params = new URLSearchParams();
    if (search.trim()) params.append('search', search.trim());
    if (status && status !== 'All') params.append('status', status);

    const url = params.toString() ? `${API_BASE_URL}?${params.toString()}` : API_BASE_URL;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    return handleResponse(response);
  },

  /**
   * Fetch a single opportunity by its ID
   */
  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    return handleResponse(response);
  },

  /**
   * Create a new research opportunity
   */
  async create(data) {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  /**
   * Update an existing opportunity
   */
  async update(id, data) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  /**
   * Quick action to close an opportunity
   */
  async close(id) {
    return this.update(id, { status: 'Closed' });
  },

  /**
   * Delete an opportunity by ID
   */
  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    });
    return handleResponse(response);
  }
};
