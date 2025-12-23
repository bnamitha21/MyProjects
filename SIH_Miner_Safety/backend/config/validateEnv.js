const requiredKeys = [
  'JWT_SECRET',
  'MONGODB_URI',
  'CLIENT_URL'
];

export const validateEnv = () => {
  const missingKeys = requiredKeys.filter((key) => !process.env[key]);

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingKeys.join(', ')}`
    );
  }

  if (!process.env.PORT) {
    process.env.PORT = '5000';
  }
};

export default validateEnv;

