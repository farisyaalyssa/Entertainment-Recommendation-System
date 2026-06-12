const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/functional',
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:8000',
    headless: true,
  },
  webServer: [
    {
      command: 'npm run dev',
      cwd: './backend',
      url: 'http://localhost:3000/',
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: 'python3 -m http.server 8000',
      url: 'http://localhost:8000/',
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],
});
