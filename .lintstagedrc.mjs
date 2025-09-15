import fs from 'node:fs';
import path from 'node:path';

const perPackage = (resolver) => (files) => {
  return Array.from(
    files.reduce((packages, file) => {
      let directory = path.dirname(file);

      while (directory && directory !== process.cwd()) {
        if (fs.existsSync(path.join(directory, 'package.json'))) {
          packages.add(resolver(directory, file));
          break;
        }
        const parent = path.dirname(directory);
        if (parent === directory) break;
        directory = parent;
      }
      return packages;
    }, new Set()),
  );
};

export default {
  '*': 'prettier --ignore-unknown --write',
  '*.ts': () => 'npm run type-check --workspaces',
  '*.{js,ts}': 'eslint --fix',
  '**/{*.ts,package.json}': perPackage((directory) => {
    const packages = [
      'tsx',
      '@vitest/coverage-istanbul',
      '@types/json-bigint',
      '@typescript-eslint/eslint-plugin',
      '@typescript-eslint/parser',
      '@types/node',
      'eslint-config-prettier',
    ];

    const paths = ['vitest.config.ts.timestamp-*'];

    return `npx depcheck ${path.relative(
      process.cwd(),
      directory,
    )} --ignores="${packages.join(', ')}" --ignore-patterns="${paths.join(
      ',',
    )}"`;
  }),
};
