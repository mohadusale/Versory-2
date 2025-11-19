/**
 * Sistema centralizado de manejo de errores
 * 
 * Este módulo proporciona clases y funciones para manejar errores
 * de forma consistente en toda la aplicación.
 */

import { AxiosError } from 'axios';
import { Alert } from 'react-native';

/**
 * Códigos de error personalizados de la aplicación
 */
export enum ErrorCode {
  // Errores de red
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  
  // Errores de autenticación
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  
  // Errores de validación
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Errores del servidor
  SERVER_ERROR = 'SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  FORBIDDEN = 'FORBIDDEN',
  
  // Errores de la aplicación
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Clase base para errores de la aplicación
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public code: ErrorCode,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'AppError';
    
    // Mantener el stack trace correcto
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Convierte el error a un objeto serializable
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      data: this.data,
    };
  }
}

/**
 * Mapeo de códigos de estado HTTP a códigos de error de la aplicación
 */
const HTTP_STATUS_TO_ERROR_CODE: Record<number, ErrorCode> = {
  400: ErrorCode.VALIDATION_ERROR,
  401: ErrorCode.UNAUTHORIZED,
  403: ErrorCode.FORBIDDEN,
  404: ErrorCode.NOT_FOUND,
  408: ErrorCode.TIMEOUT_ERROR,
  500: ErrorCode.SERVER_ERROR,
  502: ErrorCode.SERVER_ERROR,
  503: ErrorCode.SERVER_ERROR,
  504: ErrorCode.TIMEOUT_ERROR,
};

/**
 * Mapeo de códigos de error de Axios a códigos de error de la aplicación
 */
const AXIOS_ERROR_CODE_TO_APP_ERROR: Record<string, ErrorCode> = {
  'ECONNABORTED': ErrorCode.TIMEOUT_ERROR,
  'ENOTFOUND': ErrorCode.NETWORK_ERROR,
  'ECONNREFUSED': ErrorCode.CONNECTION_ERROR,
  'ETIMEDOUT': ErrorCode.TIMEOUT_ERROR,
  'ERR_NETWORK': ErrorCode.NETWORK_ERROR,
  'ERR_CANCELED': ErrorCode.NETWORK_ERROR,
};

/**
 * Mensajes de error amigables para el usuario
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.NETWORK_ERROR]: 'No se pudo conectar al servidor. Verifica tu conexión a internet.',
  [ErrorCode.TIMEOUT_ERROR]: 'La solicitud tardó demasiado tiempo. Intenta de nuevo.',
  [ErrorCode.CONNECTION_ERROR]: 'No se pudo establecer conexión con el servidor.',
  
  [ErrorCode.UNAUTHORIZED]: 'No estás autorizado. Por favor, inicia sesión de nuevo.',
  [ErrorCode.TOKEN_EXPIRED]: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.',
  [ErrorCode.INVALID_CREDENTIALS]: 'Email o contraseña incorrectos.',
  
  [ErrorCode.VALIDATION_ERROR]: 'Los datos ingresados no son válidos.',
  [ErrorCode.INVALID_INPUT]: 'Por favor, verifica los datos ingresados.',
  
  [ErrorCode.SERVER_ERROR]: 'Ocurrió un error en el servidor. Intenta más tarde.',
  [ErrorCode.NOT_FOUND]: 'El recurso solicitado no fue encontrado.',
  [ErrorCode.FORBIDDEN]: 'No tienes permiso para realizar esta acción.',
  
  [ErrorCode.UNKNOWN_ERROR]: 'Ocurrió un error inesperado. Intenta de nuevo.',
};

/**
 * Convierte un error de Axios en un AppError
 * @param error - Error de Axios a convertir
 * @returns AppError con información estructurada
 */
export const handleAxiosError = (error: AxiosError): AppError => {
  // Error de red (sin respuesta del servidor)
  if (!error.response) {
    const axiosCode = error.code || 'UNKNOWN';
    const errorCode = AXIOS_ERROR_CODE_TO_APP_ERROR[axiosCode] || ErrorCode.NETWORK_ERROR;
    
    return new AppError(
      ERROR_MESSAGES[errorCode],
      errorCode,
      undefined,
      { originalError: error.message }
    );
  }

  // Error con respuesta del servidor
  const status = error.response.status;
  const responseData = error.response.data as any;
  
  // Determinar el código de error
  let errorCode = HTTP_STATUS_TO_ERROR_CODE[status] || ErrorCode.UNKNOWN_ERROR;
  
  // Casos especiales
  if (status === 401) {
    errorCode = ErrorCode.UNAUTHORIZED;
  }
  
  // Extraer mensaje de error del servidor
  let message = ERROR_MESSAGES[errorCode];
  
  if (responseData) {
    // Intentar obtener mensaje del backend
    message = responseData.detail 
      || responseData.message 
      || responseData.error
      || message;
      
    // Si hay errores de validación específicos
    if (responseData.errors && typeof responseData.errors === 'object') {
      const firstError = Object.values(responseData.errors)[0];
      if (Array.isArray(firstError) && firstError.length > 0) {
        message = firstError[0];
      }
    }
  }
  
  return new AppError(
    message,
    errorCode,
    status,
    responseData
  );
};

/**
 * Maneja cualquier tipo de error y lo convierte en AppError
 * @param error - Error a manejar (puede ser de cualquier tipo)
 * @returns AppError estructurado
 */
export const handleError = (error: unknown): AppError => {
  // Ya es un AppError
  if (error instanceof AppError) {
    return error;
  }
  
  // Error de Axios
  if (error instanceof AxiosError) {
    return handleAxiosError(error);
  }
  
  // Error estándar de JavaScript
  if (error instanceof Error) {
    return new AppError(
      error.message || ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR],
      ErrorCode.UNKNOWN_ERROR,
      undefined,
      { originalError: error.message }
    );
  }
  
  // Error desconocido
  return new AppError(
    ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR],
    ErrorCode.UNKNOWN_ERROR,
    undefined,
    { originalError: String(error) }
  );
};

/**
 * Opciones para mostrar errores al usuario
 */
interface ShowErrorOptions {
  /** Título del alert (por defecto: "Error") */
  title?: string;
  /** Si se debe loguear el error en consola (por defecto: true en dev) */
  logError?: boolean;
  /** Botones personalizados para el alert */
  buttons?: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>;
}

/**
 * Muestra un error al usuario con un Alert
 * @param error - Error a mostrar
 * @param options - Opciones de visualización
 */
export const showError = (
  error: unknown,
  options: ShowErrorOptions = {}
): void => {
  const {
    title = 'Error',
    logError = __DEV__,
    buttons = [{ text: 'OK' }],
  } = options;
  
  const appError = handleError(error);
  
  // Loguear en desarrollo
  if (logError) {
    console.error(`[ErrorHandler] ${appError.code}:`, {
      message: appError.message,
      status: appError.status,
      data: appError.data,
      stack: appError.stack,
    });
  }
  
  // Mostrar alert al usuario
  Alert.alert(title, appError.message, buttons);
};

/**
 * Opciones para toast de error (futuro: usar react-native-toast-message)
 */
interface ToastErrorOptions {
  /** Duración del toast en ms */
  duration?: number;
  /** Posición del toast */
  position?: 'top' | 'bottom';
}

/**
 * Muestra un error como toast (implementación futura)
 * Por ahora usa Alert como fallback
 * @param error - Error a mostrar
 * @param options - Opciones del toast
 */
export const showErrorToast = (
  error: unknown,
  options: ToastErrorOptions = {}
): void => {
  // TODO: Implementar con react-native-toast-message
  const appError = handleError(error);
  
  if (__DEV__) {
    console.warn('[ErrorHandler] Toast:', appError.message);
  }
  
  // Fallback a Alert por ahora
  Alert.alert('', appError.message, [{ text: 'OK' }]);
};

/**
 * Verifica si un error es de un tipo específico
 * @param error - Error a verificar
 * @param code - Código de error a comparar
 * @returns true si el error es del tipo especificado
 */
export const isErrorOfType = (error: unknown, code: ErrorCode): boolean => {
  if (error instanceof AppError) {
    return error.code === code;
  }
  return false;
};

/**
 * Verifica si un error es de autenticación
 * @param error - Error a verificar
 * @returns true si es error de auth
 */
export const isAuthError = (error: unknown): boolean => {
  return isErrorOfType(error, ErrorCode.UNAUTHORIZED) 
    || isErrorOfType(error, ErrorCode.TOKEN_EXPIRED);
};

/**
 * Verifica si un error es de red
 * @param error - Error a verificar
 * @returns true si es error de red
 */
export const isNetworkError = (error: unknown): boolean => {
  return isErrorOfType(error, ErrorCode.NETWORK_ERROR)
    || isErrorOfType(error, ErrorCode.CONNECTION_ERROR)
    || isErrorOfType(error, ErrorCode.TIMEOUT_ERROR);
};

