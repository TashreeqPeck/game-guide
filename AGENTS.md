# Commit rules

When creating commits:

- Use Conventional Commit messages in the form `type(scope): subject`, following the types and rules in `commitlint.config.js`.
- Keep the type, optional scope, and subject lowercase. Do not end the subject with a period, and keep the header within 100 characters.
- Make each commit atomic and logical: include one coherent change and keep unrelated work in separate commits.
- Avoid unnecessary or superfluous commits; do not create extra commits for intermediate steps when related changes can be committed together.
