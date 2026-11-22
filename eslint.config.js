import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteParser from 'svelte-eslint-parser';

export default ts.config(
	{ ignores: ['build/**', '.svelte-kit/**', 'node_modules/**'] },
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: ts.parser,
				extraFileExtensions: ['.svelte']
			}
		}
	},
	{
	languageOptions: {
		globals: { ...globals.browser, ...globals.node }
	},
	rules: {
		'no-empty': ['error', { allowEmptyCatch: false }],
		'svelte/no-navigation-without-resolve': 'off',
		'svelte/no-at-html-tags': 'off',
		'svelte/prefer-svelte-reactivity': 'off',
		'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
	}
});