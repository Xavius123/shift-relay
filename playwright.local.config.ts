import base from './playwright.config';
import { defineConfig } from '@playwright/test';
export default defineConfig({ ...base, use: { ...base.use, baseURL: 'http://localhost:8082' }, webServer: { ...base.webServer!, url: 'http://localhost:8082', command: 'npx expo start --web --port 8082' } });
