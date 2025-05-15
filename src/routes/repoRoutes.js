const express = require('express');
const { simpleGit } = require('simple-git');  // Import simple-git
const path = require('path');
const fs = require('fs');

const router = express.Router();

// POST route to analyze/clone the GitHub repo
router.post('/analyze', async (req, res) => {
  const { repoUrl } = req.body;

  // Check if repoUrl exists in the request body
  if (!repoUrl) {
    return res.status(400).json({ error: 'repoUrl is required' });
  }

  // Extract the repo name from the URL
  const repoName = repoUrl.split('/').pop()?.replace('.git', '') || 'repo';
  const localPath = path.join(__dirname, '..', 'tmp', repoName);

  try {
    // Remove the old repository folder if it exists
    if (fs.existsSync(localPath)) {
      fs.rmSync(localPath, { recursive: true, force: true });
    }

    const git = simpleGit();
    
    // Clone the repository
    await git.clone(repoUrl, localPath);

    res.json({ message: `Cloned ${repoName} to ${localPath}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to clone the repo' });
  }
});

module.exports = router;
