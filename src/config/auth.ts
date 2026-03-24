export const AUTH_CONFIG = {
    ISSUER: import.meta.env.VITE_IDENTITY_ISSUER,
    TENANT: import.meta.env.VITE_TENANT_SLUG,
    CLIENT_ID: import.meta.env.VITE_CLIENT_ID,
    REDIRECT_URI: import.meta.env.VITE_REDIRECT_URI,
    SCOPES: import.meta.env.VITE_OAUTH_SCOPES || 'openid profile email offline_access',
    API_URL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
};