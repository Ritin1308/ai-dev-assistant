const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY, // 🔐 Your DeepSeek API key
  baseURL: 'https://api.deepseek.com/v1' // ✅ DeepSeek's base URL
});

async function analyzeRepoWithAI(repoPath) {
  let summary = '';
  const fileList = [];

  function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        walk(fullPath);
      } else if (
        fullPath.endsWith('.js') ||
        fullPath.endsWith('.ts') ||
        fullPath.endsWith('.jsx') ||
        fullPath.endsWith('.tsx')
      ) {
        fileList.push(fullPath);
      }
    }
  }

  walk(repoPath);

  const filesToRead = fileList.slice(0, 5); // Limit for short input
  let content = '';

  for (const file of filesToRead) {
    const relPath = path.relative(repoPath, file);
    const fileContent = fs.readFileSync(file, 'utf-8');
    content += `File: ${relPath}\n${fileContent}\n\n`;
  }

  const messages = [
    {
      role: 'user',
      content: `Analyze every files in this repository and provide a high and low level description and also provide some optimal modifications if required:\n\n${content}`
    }
  ];

  const completion = await openai.chat.completions.create({
    model: 'deepseek-chat',
    messages,
    temperature: 0.7,
    max_tokens: 800
  });

  summary = completion.choices[0].message.content;
  return summary;
}

module.exports = { analyzeRepoWithAI };
