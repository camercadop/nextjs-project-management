import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
    test: {
        globals: true,
        coverage: {
            provider: 'v8',
            reporter: ['text'],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname),
        },
    },
})
