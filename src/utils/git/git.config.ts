import { resolve } from 'node:path';
import { GLOBAL_INTERFACE_PREFIX, PREFIX } from 'utils/global.config';
import { isPord } from 'utils/common';

const GIT_REPOSITORE = isPord()
  ? '../../git-repository'
  : '../../../../git-repository';

export const addGitSuffix = (name: string) => `${name}.git`;

export const getGitRepositoryPath = (path = '') => {
  if (path) {
    return resolve(__dirname, `${GIT_REPOSITORE}/${addGitSuffix(path)}`);
  }
  return resolve(__dirname, `${GIT_REPOSITORE}`);
};

export const getGitRouterUrl = (projectName = '') => {
  const prefix = '/repository';
  if (projectName) {
    return `${prefix}/${addGitSuffix(projectName)}`;
  }
  return prefix;
};

export const getGitOriginUrl = (req, projectName: string) => {
  const protocol = req.protocol;
  const host = req.headers.host;
  const url = `${protocol}://${host}${GLOBAL_INTERFACE_PREFIX}${PREFIX}${getGitRouterUrl(
    projectName,
  )}`;
  return url;
};

export const gitTempFolder = (url: string, path = '') => {
  const root = 'tempFolder';
  return {
    rootPath: resolve(url, root),
    execPath: resolve(url, root, path),
  };
};

export const getRunjs = () => 'nodeCi.js';
