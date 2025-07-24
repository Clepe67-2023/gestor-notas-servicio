/// <reference types="vite/client" />

// By augmenting the NodeJS namespace, we add our environment variable to the
// global process.env type without causing redeclaration errors. This is the
// standard way to type environment variables that are injected at build time.
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
  }
}