import { defineConfig } from 'vitest/config'

const isCI = process.env.CI === 'true'

export default defineConfig({
  test: {
    coverage: {
      ...(isCI && { reporter: ['json-summary'] }),
      provider: 'istanbul',
      include: ['src'],
      exclude: [
        '**/*.spec.ts',
        '**/*.mock.ts',
        './src/main.ts',
      ],
    },
  },
})
