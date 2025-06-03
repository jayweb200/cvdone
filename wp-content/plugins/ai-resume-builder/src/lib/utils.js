// Placeholder for utils.js (converted from utils.ts)
// In a real scenario, this would contain utility functions used by components.

/**
 * Example utility function.
 * @param {string} name
 * @returns {string}
 */
export function greet(name) {
  return `Hello, ${name}!`;
}

/**
 * Example function to format a date.
 * @param {string | Date} dateInput
 * @returns {string}
 */
export function formatDate(dateInput) {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Add other utility functions that might have been in utils.ts
// For example, a function to generate unique IDs (simple version)
export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// Placeholder for cn function if it was used (common in shadcn/ui)
// This is a simplified version. A real one would handle conditional classes better.
export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}
