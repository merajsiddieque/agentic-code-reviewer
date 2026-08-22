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

/**
 * Fetch precomputed benchmark evaluation report.
 * @returns {Promise<{summary: object, per_example_scores: Array, failed_cases: Array}>}
 */
export async function getEvaluationReport() {
  try {
    const res = await axios.get('/evaluation', { timeout: 5000 });
    return res.data;
  } catch (e1) {
    try {
      const res = await axios.get('http://127.0.0.1:8000/evaluation', { timeout: 5000 });
      return res.data;
    } catch (e2) {
      const res = await axios.get('http://localhost:8000/evaluation', { timeout: 5000 });
      return res.data;
    }
  }
}

export default {
  checkHealth,
  reviewCode,
  getEvaluationReport,
};
