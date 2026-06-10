import { defineConfig } from 'prisma-client-js'

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
})