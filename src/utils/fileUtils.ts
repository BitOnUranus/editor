/**
 * Utility functions for handling file operations and base64 encoding/decoding
 */

/**
 * Encodes text content to base64
 */
export const encodeContent = (content: string): string => {
  return btoa(encodeURIComponent(content));
};

/**
 * Decodes base64 content to text
 */
export const decodeContent = (base64: string): string => {
  try {
    return decodeURIComponent(atob(base64));
  } catch (e) {
    console.error('Error decoding content:', e);
    return '';
  }
};

/**
 * Saves content to a file (in browser storage)
 */
export const saveFile = async (fileName: string, content: string): Promise<void> => {
  localStorage.setItem(fileName, content);
  
  // For demonstration purposes, we'll also save this to a blob
  // In a real app, you might use the File System Access API
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  // This is optional - just to show how we might save a file to disk
  if (process.env.NODE_ENV === 'development') {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    // Uncommenting the next line would trigger a file download
    // a.click();
    URL.revokeObjectURL(url);
  }
};

/**
 * Loads file content (from browser storage)
 */
export const loadFile = async (fileName: string): Promise<string> => {
  const content = localStorage.getItem(fileName);
  if (!content) {
    throw new Error(`File ${fileName} not found`);
  }
  return content;
};

/**
 * Checks if a file exists (in browser storage)
 */
export const fileExists = async (fileName: string): Promise<boolean> => {
  return localStorage.getItem(fileName) !== null;
};