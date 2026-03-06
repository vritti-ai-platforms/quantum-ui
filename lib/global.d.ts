/// <reference types="vite/client" />

// Global type declarations for CSS imports
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module 'react-phone-number-input/style.css' {
  const content: Record<string, string>;
  export default content;
}
