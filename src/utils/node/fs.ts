import * as fs from 'fs/promises';
import { checkValueNull } from '../common';

/**
 * 校验文件夹/文件是否存在
 */
export const dirExists = async (dir: string) =>
  await fs
    .stat(dir)
    .then(() => true)
    .catch(() => false);
/**
 * 校验是否文件或者文件夹
 * @param dir
 * @param type 1文件,2文件夹
 */
export const checkDir = async (dir: string, type: 1 | 2) => {
  if (checkValueNull(dir)) return false;
  const info = await fs.stat(dir);
  switch (type) {
    case 1:
      return info.isFile();
    case 2:
      return info.isDirectory();
  }
};
/**
 * 创建文件夹
 */
export const createFolder = (path: string): Promise<boolean> => {
  return new Promise(async (resolve) => {
    if (!(await dirExists(path))) {
      const result = await fs
        .mkdir(path, { recursive: true })
        .then(() => true)
        .catch(() => false);
      resolve(result);
    } else {
      return resolve(false);
    }
  });
};
/**
 * 创建文件
 */
export const createFile = (
  path: string,
  content: string | NodeJS.ArrayBufferView = '',
): Promise<boolean> => {
  return new Promise(async (resolve) => {
    if (!(await dirExists(path))) {
      const result = await fs
        .writeFile(path, content)
        .then(() => true)
        .catch(() => false);
      resolve(result);
    } else {
      return resolve(false);
    }
  });
};
/**
 * 递归删除文件夹
 */
export const deleteFolder = async (path: string) => {
  await fs
    .rm(path, { recursive: true })
    .then(() => true)
    .catch(() => false);
};
/**
 *读取文件
 */
export const readFile = async (path: string) => {
  await fs.readFile(path, 'utf8').catch(() => '');
};
