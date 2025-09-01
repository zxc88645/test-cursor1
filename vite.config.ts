import { defineConfig } from 'vite'

// Use BASE_PATH env for GitHub Pages (e.g., /repo-name/). Defaults to '/'
const base = process.env.BASE_PATH && process.env.BASE_PATH.trim() !== ''
  ? process.env.BASE_PATH
  : '/'

export default defineConfig({
  base,
})

