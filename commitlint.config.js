export default {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'type-enum': [
			2,
			'always',
			['feat', 'fix', 'perf', 'revert', 'docs', 'style', 'refactor', 'test', 'build', 'ci', 'chore']
		],
		'type-case': [2, 'always', 'lower-case'],
		'scope-case': [2, 'always', 'lower-case'],
		'subject-case': [2, 'always', 'lower-case'],
		'subject-full-stop': [2, 'never', '.'],
		'header-max-length': [2, 'always', 100],
		'body-leading-blank': [2, 'always'],
		'footer-leading-blank': [2, 'always']
	}
};