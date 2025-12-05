/**
 * Configuración y validación de variables de entorno
 * 
 * Este módulo asegura que todas las variables de entorno necesarias
 * estén presentes antes de que la aplicación se inicie.
 */

/**
 * Obtiene una variable de entorno y lanza un error si no existe
 * @param key - Nombre de la variable de entorno
 * @returns El valor de la variable de entorno
 * @throws Error si la variable no está definida
 */
const getRequiredEnvVar = (key: string): string => {
  const value = process.env[key];
  
  if (!value || value.trim() === '') {
    throw new Error(
      `❌ Variable de entorno requerida no encontrada: ${key}\n\n` +
      `Por favor, asegúrate de que existe un archivo .env con:\n` +
      `${key}=tu_valor_aqui\n\n` +
      `Para más información, consulta la documentación del proyecto.`
    );
  }
  
  return value;
};

/**
 * Obtiene una variable de entorno opcional con un valor por defecto
 * @param key - Nombre de la variable de entorno
 * @param defaultValue - Valor por defecto si la variable no existe
 * @returns El valor de la variable o el valor por defecto
 */
const getOptionalEnvVar = (key: string, defaultValue: string): string => {
  const value = process.env[key];
  return value && value.trim() !== '' ? value : defaultValue;
};

/**
 * Valida que una URL sea válida
 * @param url - URL a validar
 * @returns true si la URL es válida
 */
const isValidUrl = (url: string): boolean => {
  try {
    // Intenta crear un objeto URL, lanzará error si es inválida
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Valida y obtiene la URL de la API
 * @returns URL de la API validada
 * @throws Error si la URL no es válida
 */
const getApiUrl = (): string => {
  const apiUrl = getRequiredEnvVar('EXPO_PUBLIC_API_URL');
  
  if (!isValidUrl(apiUrl)) {
    throw new Error(
      `❌ La URL de la API no es válida: ${apiUrl}\n\n` +
      `La URL debe tener el formato: http://ejemplo.com o https://ejemplo.com\n` +
      `Verifica tu archivo .env`
    );
  }
  
  return apiUrl;
};

/**
 * Configuración de la aplicación con todas las variables de entorno validadas
 */
export const ENV = {
  // URL de la API (requerida)
  API_URL: getApiUrl(),
  
  // Entorno de ejecución
  IS_DEV: __DEV__,
  IS_PROD: !__DEV__,
  
  // Configuración de timeouts (en milisegundos)
  API_TIMEOUT: parseInt(getOptionalEnvVar('EXPO_PUBLIC_API_TIMEOUT', '10000'), 10),
  
  // Configuración de tokens
  TOKEN_REFRESH_INTERVAL: parseInt(getOptionalEnvVar('EXPO_PUBLIC_TOKEN_REFRESH_INTERVAL', '120000'), 10), // 2 minutos
  TOKEN_EXPIRY_THRESHOLD: parseInt(getOptionalEnvVar('EXPO_PUBLIC_TOKEN_EXPIRY_THRESHOLD', '300'), 10), // 5 minutos en segundos
  
  // Configuración de cache
  CACHE_STALE_TIME: parseInt(getOptionalEnvVar('EXPO_PUBLIC_CACHE_STALE_TIME', '300000'), 10), // 5 minutos
  CACHE_GC_TIME: parseInt(getOptionalEnvVar('EXPO_PUBLIC_CACHE_GC_TIME', '600000'), 10), // 10 minutos
} as const;

/**
 * Imprime la configuración actual (solo en desarrollo)
 * Útil para debugging
 */
export const printConfig = () => {
  if (!__DEV__) return;
  
};

// Validar configuración al importar este módulo
// Si falta alguna variable requerida, la app no se iniciará
try {
  // Forzar la evaluación de todas las propiedades del objeto ENV
  Object.values(ENV);
  
  if (__DEV__) {
  }
} catch (error) {
  // Error validating environment variables
  throw error;
}

