import axios from 'axios';

/**
 * Check backend connection status using proxy with local fallbacks.
 * @returns {Promise<{status: string, project: string, model: string}>}
 */
export async function checkHealth() {
  try {
    const res = await axios.get('/health', { timeout: 5000 });
    return res.data;
  } catch (e1) {
    try {
      const res = await axios.get('http://127.0.0.1:8000/health', { timeout: 5000 });
      return res.data;
    } catch (e2) {
      const res = await axios.get('http://localhost:8000/health', { timeout: 5000 });
      return res.data;
    }
  }
}

/**
 * Upload source code file for agentic code review.
 * @param {File} file - Source code file to be reviewed
 * @returns {Promise<{filename: string, review: string, route: string, execution_time: number}>}
 */
export async function reviewCode(file) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await axios.post('/review', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 180000,
    });
    return res.data;
  } catch (e1) {
    try {
      const res = await axios.post('http://127.0.0.1:8000/review', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 180000,
      });
      return res.data;
    } catch (e2) {
      const res = await axios.post('http://localhost:8000/review', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 180000,
      });
      return res.data;
    }
  }
}

export async function getEvaluationReport() {
  const options = {
    headers: {
      Accept: 'application/json',
    },
    timeout: 7000,
  };

  try {
    const res = await axios.get('/api/evaluation', options);
    if (res.data && typeof res.data === 'object') return res.data;
  } catch (e0) {
    // Continue to fallback endpoints
  }

  try {
    const res = await axios.get('/evaluation', options);
    if (res.data && typeof res.data === 'object') return res.data;
  } catch (e1) {
    // Continue
  }

  try {
    const res = await axios.get('http://127.0.0.1:8000/api/evaluation', options);
    if (res.data && typeof res.data === 'object') return res.data;
  } catch (e2) {
    // Continue
  }

  try {
    const res = await axios.get('http://localhost:8000/api/evaluation', options);
    if (res.data && typeof res.data === 'object') return res.data;
  } catch (e3) {
    // Continue
  }

  throw new Error('Failed to fetch evaluation report from backend.');
}

export default {
  checkHealth,
  reviewCode,
  getEvaluationReport,
};
