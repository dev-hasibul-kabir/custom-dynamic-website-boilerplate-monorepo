module.exports = {
  extends: ['@repo/eslint-config/nestjs'],
  parserOptions: {
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
  },
};
