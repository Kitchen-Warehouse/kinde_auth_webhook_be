
import { defineConfig } from 'tsup';

export default defineConfig((options) => {
    const dev = options.env?.['NODE_ENV'] === 'dev';
    return {
        entry: ['./src/edge-functions/create-user.ts'],
        outDir: "netlify/edge-functions",
        format: ["esm"],
        sourcemap: true,
        watch: dev,
        noExternal: [/(.*)/],
    };
});
