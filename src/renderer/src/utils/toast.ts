import zIndex from '@mui/material/styles/zIndex'
import toast, { ToastOptions } from 'react-hot-toast'

// Common toast options for consistency
const commonOptions: ToastOptions = {
  position: 'top-right',
  duration: 2000,
  style: {
    borderRadius: '8px',
    background: '#333',
    color: '#fff',
    zIndex: zIndex.modal * 100
  }
}

// Success Toast
export const successToast = (message: string, id?: string, options?: ToastOptions): string => {
  if (id) {
    toast.dismiss(id) // Dismiss specific toast by id
  }
  return toast.success(message, {
    ...commonOptions,
    ...options,
    icon: '✅' // Optional: add custom icons for different types
  })
}

// Error Toast
export const errorToast = (message: string, id?: string, options?: ToastOptions): string => {
  if (id) {
    toast.dismiss(id)
  }
  return toast.error(message, {
    ...commonOptions,
    ...options,
    icon: '❌'
  })
}

// Warning Toast
export const warningToast = (message: string, id?: string, options?: ToastOptions): string => {
  if (id) {
    toast.dismiss(id)
  }
  return toast(message, {
    ...commonOptions,
    ...options,
    icon: '⚠️',
    style: {
      ...commonOptions.style,
      background: '#FFA500' // Adjust background color for warning
    }
  })
}

// Info Toast
export const infoToast = (message: string, id?: string, options?: ToastOptions): string => {
  if (id) {
    toast.dismiss(id)
  }
  return toast(message, {
    ...commonOptions,
    ...options,
    icon: 'ℹ️',
    style: {
      ...commonOptions.style,
      background: '#3b82f6' // Info-specific color
    }
  })
}

// Default Toast
export const defaultToast = (message: string, id?: string, options?: ToastOptions): string => {
  if (id) {
    toast.dismiss(id)
  }
  return toast(message, { ...commonOptions, ...options }) // Basic toast with common options
}
