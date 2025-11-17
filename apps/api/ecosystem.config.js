const config = {
	apps: [
		{
			name: 'example-core',
			script: './dist/src/main.js',
			instances: 'max',
			exec_mode: 'cluster',
			watch: false,
			ignore_watch: ['node_modules', 'dist'],
		},
	],
};

export default config;
