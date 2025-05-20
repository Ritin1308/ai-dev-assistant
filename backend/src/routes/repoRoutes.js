const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');
const simpleGit = require('simple-git');
const { setTimeout } = require('timers/promises');
const { analyzeRepoWithAI } = require('../utils/analyzeRepoWithAI');

// Configuration
const TEMP_DIR = path.join(__dirname, '..', '..', 'temp-repos');
const GIT_TIMEOUT = 300000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Configure git with extended timeout
const git = simpleGit({
  timeout: { block: GIT_TIMEOUT },
  maxConcurrentProcesses: 1
});

/**
 * Safely remove directory with retries for Windows file locking issues
 */
async function safeRemove(dir) {
  let retryCount = 0;
  
  while (retryCount < MAX_RETRIES) {
    try {
      await fs.remove(dir);
      return;
    } catch (err) {
      if (err.code === 'EBUSY') {
        retryCount++;
        console.warn(`Retry ${retryCount}: Could not remove ${dir}, waiting...`);
        await setTimeout(RETRY_DELAY);
      } else {
        throw err;
      }
    }
  }
  throw new Error(`Failed to remove directory after ${MAX_RETRIES} attempts`);
}

/**
 * Clone repository endpoint
 */
router.post('/analyze', async (req, res) => {
  const { repoUrl } = req.body;

  // Validate input
  if (!repoUrl || !repoUrl.includes('github.com')) {
    return res.status(400).json({ 
      error: 'Invalid URL',
      message: 'Please provide a valid GitHub repository URL'
    });
  }

  const repoName = repoUrl.split('/').pop().replace('.git', '');
  const clonePath = path.join(TEMP_DIR, repoName);
  let cloneSuccessful = false;

  try {
    // Prepare directory
    await fs.ensureDir(TEMP_DIR);
    await safeRemove(clonePath);

    // Clone with progress tracking
    console.log(`Starting clone of ${repoUrl}`);
    await git.clone(repoUrl, clonePath, [
      '--depth', '1',
      '--single-branch',
      '--progress'
    ]);
    cloneSuccessful = true;
    console.log(`Successfully cloned to ${clonePath}`);

    // Analyze with AI
    const analysis = await analyzeRepoWithAI(clonePath);
    
    res.json({
      status: 'success',
      analysis,
      repo: repoName,
      clonedAt: new Date().toISOString(),
      directory: clonePath
    });

  } catch (err) {
    console.error('Repository processing failed:', err);
    
    const errorResponse = {
      error: 'Repository processing failed',
      details: err.message.includes('timeout') 
        ? 'Operation timed out (repository too large or network slow)'
        : err.message,
      retrySuggested: !cloneSuccessful && !err.message.includes('exists')
    };

    res.status(500).json(errorResponse);
  } finally {
    // Cleanup - comment during development if you want to inspect clones
    try {
      if (cloneSuccessful) {
        await safeRemove(clonePath);
      }
    } catch (cleanupErr) {
      console.error('Cleanup failed:', cleanupErr);
    }
  }
});

module.exports = router;