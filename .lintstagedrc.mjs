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
    }, new Set())
  );
};

export default {
  '*': 'prettier --ignore-unknown --write',
  '*.ts': () => 'npm run type-check --workspaces',
  '*.{js,ts}': 'eslint --fix',
  '**/*.ts': perPackage((directory) => {
    const packages = [
      'tsx',
      '@vitest/coverage-istanbul',
      'extensionless',
      'reflect-metadata',
      '@types/json-bigint',
      '@babel/preset-env',
      '@graphql-codegen/cli',
      '@graphql-codegen/typescript',
      '@graphql-codegen/typescript-operations',
      '@types/jest',
      '@typescript-eslint/eslint-plugin',
      '@typescript-eslint/parser',
      '@types/node',
      'eslint-config-prettier',
    ];

    const paths = ['vitest.config.ts.timestamp-*'];

    fs.appendFileSync(
      '/tmp/ls.log',
      `npx depcheck --ignores="${packages.join(
        ', '
      )}" --ignore-patterns="${paths.join(', ')}" ${path.relative(
        process.cwd(),
        directory
      )}`
    );

    return `npx depcheck ${path.relative(
      process.cwd(),
      directory
    )} --ignores="${packages.join(', ')}" --ignore-patterns="${paths.join(
      ', '
    )}"`;
  }),
};
