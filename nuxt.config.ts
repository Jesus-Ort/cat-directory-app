// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@pinia/nuxt'],
  app: {
  head: {
    htmlAttrs: {
      lang: 'es',
    },
  },
},
  compatibilityDate: '2025-07-15',
  css: ['~/assets/css/main.css'],
  experimental: {
    viewTransition: true,
  },
  devtools: { enabled: true }
})
