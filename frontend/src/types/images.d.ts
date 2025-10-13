declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

// Fallback for imports using the '@' alias (e.g. import logo from '@/assets/logo.png')
declare module '@/*' {
  const value: string;
  export default value;
}