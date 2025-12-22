export const corsOptions = {
    origin: process.env.NODE_ENV === 'prod'
        ? ['http://test.com'] 
        : '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}