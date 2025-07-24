/// <reference types="vite/client" />

/**
 * Declara la variable 'process' globalmente para que TypeScript
 * la reconozca durante la compilación. Vite se encarga de reemplazar
 * 'process.env.API_KEY' con el valor real en el build, por lo que esto
 * es solo para satisfacer al compilador de tipos.
 */
declare var process: {
  env: {
    readonly API_KEY: string;
  };
};
