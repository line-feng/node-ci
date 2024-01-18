import { execTaskAsync, execCommand } from 'utils/node/exec';
import { gitTempFolder } from 'utils/git/git.config';

export const initGitRepository = async (path: string) => {
  const result = await execCommand({ command: 'git init --bare', cwd: path });
  return result;
};

export const addGitRemote = async (
  path: string,
  url: string,
  projectName: string,
) => {
  const { rootPath, execPath } = gitTempFolder(`${path}`, 'initTemp');
  const projectPath = `${execPath}/${projectName}`;
  const list = await execTaskAsync([
    { command: `mkdir ${execPath}`, cwd: path, async: true },
    { command: `git clone ${url}`, cwd: execPath, async: true },
    { command: `touch README.md`, cwd: projectPath, async: true },
    { command: `git add .`, cwd: projectPath, async: true },
    {
      command: `git commit -m "feat: Initial commit"`,
      cwd: projectPath,
      async: true,
    },
    { command: `git push -u origin master`, cwd: projectPath, async: true },
    { command: `rm -rf ${rootPath}`, cwd: path },
  ]);
  const result = list.filter((v) => v === false);
  return !result?.length;
};
