import tailwindcss from '@tailwindcss/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isUserPage = repositoryName?.endsWith('.github.io');

export default defineConfig({
  base: process.env.GITHUB_ACTIONS && repositoryName && !isUserPage ? `/${repositoryName}/` : '/',
  plugins: [tailwindcss(), svelte()],
});
