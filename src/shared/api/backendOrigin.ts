const configuredBackendOrigin = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, '')

export const backendOrigin = import.meta.env.PROD ? configuredBackendOrigin : ''
