export const Env = {
    Host: process.env.BACKEND_HOST || '0.0.0.0',
    Port: parseInt(process.env.BACKEND_PORT || '8080', 10),
    Logger: (process.env.BACKEND_LOGGER || 'false') === 'true',
    JwtSecret: process.env.JWT_SECRET || 'supersecretkey' // Change in production!
    EmailUser: process.env.EMAIL_USER || 'noreplyfttranscendence@gmail.com',
    EmailPass: process.env.EMAIL_PASS || 'Trans123'
} as const;