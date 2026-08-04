/**
 * Central API Configuration
 * 
 * All API calls across the app import from here.
 * In development: points to http://localhost:5000
 * In production:  points to your Render backend URL
 */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
