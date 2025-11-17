import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive())
    .optional()
    .default('5004'),
  NEXT_PUBLIC_API_BASE_URL: z.string().url('NEXT_PUBLIC_API_BASE_URL must be a valid URL').optional(),
});

let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  });
} catch (error) {
  if (error instanceof z.ZodError) {
    const errorMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('\n');
    console.error('❌ Environment validation failed:\n', errorMessages);
    process.exit(1);
  }
  throw error;
}

export default env;

