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

const getKnipCommand = (dir) => {
  const posixRelative = path.posix.relative(process.cwd(), dir);
  return `knip --dependencies --workspace ${posixRelative}`;
};

const runKnipConditional = (files) => {
  const rootChanged = files.some((f) => {
    const relative = path.relative(process.cwd(), path.resolve(f));
    return !relative.includes(path.sep);
  });
  if (rootChanged) {
    return ['knip --dependencies'];
  } else {
    return perPackage(getKnipCommand)(files);
  }
};

let tasks = {};

if (!process.env.CI) {
  tasks = {
    '*.ts': () => 'npm run type-check',
    '*.{js,ts}': ['eslint --fix'],
    '*': ['prettier --ignore-unknown --write', runKnipConditional],
  };
}

export default tasks;
