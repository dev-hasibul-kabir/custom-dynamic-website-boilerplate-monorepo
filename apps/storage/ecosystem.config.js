const config = {
  apps: [
    {
      name: 'node-express-dynamic-storage',
      script: './dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      ignore_watch: ['node_modules', 'dist'],
    },
  ],
};

export default config;
