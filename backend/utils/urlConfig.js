export const FRONTEND_URL = process.env.NODE_ENV === 'production'
    ? (process.env.FRONTEND_URL || 'https://krishi-sanchay.vercel.app').replace(/\/$/, "")
    : 'http://localhost:5173';

export const BACKEND_URL = (process.env.NODE_ENV === 'production'
    ? process.env.BACKEND_URL
    : `http://localhost:${process.env.PORT || 5000}`
).replace(/\/$/, "");
