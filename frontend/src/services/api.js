export const analyzeRepo = async (repoUrl) => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl }),
    });
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    return { error: 'Failed to connect to backend' };
  }
};