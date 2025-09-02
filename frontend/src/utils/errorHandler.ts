/**
 * Safely converts error messages to strings for use in Alert components
 * Handles cases where error messages might be arrays or other non-string types
 */
export const safeErrorToString = (error: any, fallbackMessage: string = 'An error occurred'): string => {
  try {
    // If it's already a string, return it
    if (typeof error === 'string') {
      return error;
    }
    
    // If it's an array, join it
    if (Array.isArray(error)) {
      return error.join(', ');
    }
    
    // If it's an object with a message property
    if (error && typeof error === 'object' && error.message) {
      const message = error.message;
      return Array.isArray(message) ? message.join(', ') : String(message);
    }
    
    // If it's an object with a detail property
    if (error && typeof error === 'object' && error.detail) {
      const detail = error.detail;
      return Array.isArray(detail) ? detail.join(', ') : String(detail);
    }
    
    // Try to convert to string
    return String(error);
  } catch (e) {
    console.error('Error converting error to string:', e);
    return fallbackMessage;
  }
};

/**
 * Extracts error message from API response error object
 */
export const extractApiErrorMessage = (error: any, fallbackMessage: string = 'An error occurred'): string => {
  try {
    // Check for API response structure
    if (error?.response?.data?.detail) {
      return safeErrorToString(error.response.data.detail, fallbackMessage);
    }
    
    if (error?.response?.data?.message) {
      return safeErrorToString(error.response.data.message, fallbackMessage);
    }
    
    // Check for direct error message
    if (error?.message) {
      return safeErrorToString(error.message, fallbackMessage);
    }
    
    // Fallback
    return safeErrorToString(error, fallbackMessage);
  } catch (e) {
    console.error('Error extracting API error message:', e);
    return fallbackMessage;
  }
};
