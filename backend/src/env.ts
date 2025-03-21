export const Env = {
    Host: process.env.BACKEND_HOST || '0.0.0.0',
    Port: parseInt(process.env.BACKEND_PORT || '8080', 10),
    Logger: (process.env.BACKEND_LOGGER || 'false') === 'true',
    JwtSecret: process.env.JWT_SECRET || 'supersecretkey' // Change in production!
} as const;