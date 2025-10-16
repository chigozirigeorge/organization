// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLOUDINARY_CLOUD_NAME: string
  readonly VITE_CLOUDINARY_API_KEY: string
  readonly VITE_CLOUDINARY_API_SECRET: string
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string
  readonly VITE_CLOUDINARY_FOLDER: string
  readonly VITE_CLOUDINARY_UPLOAD_PRESET_SELFIES: string
  readonly VITE_CLOUDINARY_FOLDER_SELFIES: string
  // add more env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}