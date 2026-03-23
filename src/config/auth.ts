export const AUTH_CONFIG = {
    ISSUER: import.meta.env.VITE_IDENTITY_ISSUER,
    TENANT: import.meta.env.VITE_TENANT_SLUG,
    CLIENT_ID: import.meta.env.VITE_CLIENT_ID,
    REDIRECT_URI: import.meta.env.VITE_REDIRECT_URI,
    SCOPES: 'openid profile email offline_access'
};