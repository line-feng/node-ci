import { HttpException, Injectable } from '@nestjs/common';
import { ERROR_CODE } from '../utils/code';
import { initGitRepository, addGitRemote } from '../utils/git/index';
import { createFolder, deleteFolder } from '../utils/node/fs';
import { getGitRepositoryPath } from '../utils/git/git.config';
import { GitCreate } from 'dot/git/create.dto';

@Injectable()
export class GitService {
  async createGitRepository(body: GitCreate, url: string) {
    const path = getGitRepositoryPath(body.projectName);
    let result: any;
    result = await createFolder(path);
    if (!result) {
      throw new HttpException('仓库已存在', ERROR_CODE);
    }
    result = await initGitRepository(path);
    if (!result) {
      deleteFolder(path);
      throw new HttpException('初始化仓库失败', ERROR_CODE);
    }
    if (body.remote) {
      result = await addGitRemote(path, url, body.projectName);
      if (!result) {
        deleteFolder(path);
        throw new HttpException('添加远程仓库地址失败', ERROR_CODE);
      }
    }
    return true;
  }
}
