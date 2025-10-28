/**
 * @file Vite configuration file for the SovereigntyOS AI Lab application.
 * This file configures the Vite development server, build process, plugins,
 * and environment variables.
 * @see https://vitejs.dev/config/
 */

import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Exports the Vite configuration.
 * The configuration is wrapped in a function to allow access to the current
 * `mode` (e.g., 'development', 'production') and load environment variables accordingly.
 * @param {object} params - The configuration parameters provided by Vite.
 * @param {string} params.mode - The current build mode.
 * @returns {import('vite').UserConfig} The Vite configuration object.
 */
export default defineConfig(({ mode }) => {
  // Load environment variables from .env files based on the current mode.
  // The third argument '' ensures all env variables are loaded, not just those prefixed with VITE_.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    /**
     * Configuration for the Vite development server.
     */
    server: {
      /**
       * The port to run the development server on.
       * @type {number}
       */
      port: 3000,
      /**
       * The host to bind the server to. '0.0.0.0' makes it accessible
       * from the local network, which is useful for testing on different devices.
       * @type {string}
       */
      host: '0.0.0.0',
    },
    /**
     * An array of Vite plugins to use.
     */
    plugins: [
      /**
       * Enables React support, including Fast Refresh (HMR), JSX transform, etc.
       * @see https://github.com/vitejs/vite-plugin-react
       */
      react(),
    ],
    /**
     * Defines global constants that will be replaced during the build process.
     * This is used to expose environment variables to the client-side code.
     * It's crucial to use `JSON.stringify` to ensure the values are correctly
     * embedded as strings in the code.
     */
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    /**
     * Configuration for module resolution.
     */
    resolve: {
      /**
       * Defines path aliases for easier imports.
       * The '@' alias is commonly used to point to the 'src' directory.
       */
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  };
});