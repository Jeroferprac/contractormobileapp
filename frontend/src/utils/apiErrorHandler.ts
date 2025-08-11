import { Alert } from 'react-native';
import { ApiError } from '../types/api';

/**
 * Centralized API error handling utility
 */
export class ApiErrorHandler {
  /**
   * Handle API errors with user-friendly messages
   */
  static handleError(error: any, context?: string): string {
    console.error(`API Error${context ? ` in ${context}` : ''}:`, error);

    // Handle network errors
    if (error.status_code === 0 || error.code === 'NETWORK_ERROR') {
      return 'Network error - please check your internet connection and try again';
    }

    // Handle authentication errors
    if (error.status_code === 401) {
      return 'Authentication failed - please log in again';
    }

    // Handle authorization errors
    if (error.status_code === 403) {
      return 'You do not have permission to perform this action';
    }

    // Handle not found errors
    if (error.status_code === 404) {
      return 'The requested resource was not found';
    }

    // Handle conflict errors (duplicate data)
    if (error.status_code === 409) {
      return 'This data already exists - please check your input';
    }

    // Handle validation errors
    if (error.status_code === 422) {
      return error.detail || 'Please check your input and try again';
    }

    // Handle server errors
    if (error.status_code >= 500) {
      return 'Server error - please try again later';
    }

    // Handle rate limiting
    if (error.status_code === 429) {
      return 'Too many requests - please wait a moment and try again';
    }

    // Return the error detail if available, otherwise a generic message
    return error.detail || error.message || 'An unexpected error occurred';
  }

  /**
   * Show error alert with user-friendly message
   */
  static showErrorAlert(error: any, title: string = 'Error', context?: string): void {
    const message = this.handleError(error, context);
    Alert.alert(title, message);
  }

  /**
   * Check if error is a network error
   */
  static isNetworkError(error: any): boolean {
    return error.status_code === 0 || error.code === 'NETWORK_ERROR' || !error.status_code;
  }

  /**
   * Check if error is an authentication error
   */
  static isAuthError(error: any): boolean {
    return error.status_code === 401;
  }

  /**
   * Check if error is a validation error
   */
  static isValidationError(error: any): boolean {
    return error.status_code === 422;
  }

  /**
   * Check if error should trigger a retry
   */
  static shouldRetry(error: any): boolean {
    // Retry on network errors and server errors (5xx), but not on client errors (4xx)
    return (
      this.isNetworkError(error) ||
      (error.status_code >= 500 && error.status_code < 600) ||
      error.status_code === 408 // Request timeout
    );
  }

  /**
   * Get retry delay based on attempt number (exponential backoff)
   */
  static getRetryDelay(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10 seconds
  }

  /**
   * Format error for logging
   */
  static formatErrorForLogging(error: any, context?: string): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${context}]` : '';
    
    return `[${timestamp}]${contextStr} API Error: ${JSON.stringify({
      status_code: error.status_code,
      detail: error.detail,
      message: error.message,
      code: error.code,
      stack: error.stack
    }, null, 2)}`;
  }
}

/**
 * Input validation utilities
 */
export class InputValidator {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static isValidPassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters long' };
    }
    
    if (password.length > 128) {
      return { isValid: false, message: 'Password must be less than 128 characters' };
    }
    
    // Check for at least one letter and one number
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    if (!hasLetter || !hasNumber) {
      return { isValid: false, message: 'Password must contain at least one letter and one number' };
    }
    
    return { isValid: true };
  }

  /**
   * Validate phone number format
   */
  static isValidPhone(phone: string): boolean {
    // Basic phone validation - can be enhanced based on requirements
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate required fields
   */
  static validateRequired(fields: Record<string, any>): { isValid: boolean; message?: string } {
    for (const [fieldName, value] of Object.entries(fields)) {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return { 
          isValid: false, 
          message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required` 
        };
      }
    }
    return { isValid: true };
  }

  /**
   * Sanitize input to prevent XSS
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove < and > characters
      .trim();
  }
}

export default ApiErrorHandler;
