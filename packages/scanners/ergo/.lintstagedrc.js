export default {
  '*.ts': () => 'npm run type-check',
  '*.{js,ts}': ['eslint --fix', 'vitest related --run'],
  '*': 'prettier --ignore-unknown --write',
};
