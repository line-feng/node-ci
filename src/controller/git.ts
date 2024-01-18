import {
  Controller,
  Post,
  Body,
  All,
  Param,
  Request,
  Response,
} from '@nestjs/common';
import * as backend from 'git-http-backend';
import zlib from 'zlib';
import { spawn } from 'child_process';

import { GitService } from 'service/git';
import { GitCreate } from 'dot/git/create.dto';
import { JsonData } from 'utils/jsonData';
import { SUCCESS_CODE } from 'utils/code';
import {
  getGitRepositoryPath,
  getGitRouterUrl,
  getGitOriginUrl,
} from 'utils/git/git.config';
import { PREFIX } from 'utils/global.config';
import { handleCommitAction } from 'utils/git/commit.action';

@Controller(PREFIX)
export class GitController {
  constructor(private readonly gitService: GitService) {}
  @Post('/create')
  async create(@Body() body: GitCreate, @Request() req) {
    const jsonData = new JsonData();
    const url = getGitOriginUrl(req, body.projectName);
    const result = await this.gitService.createGitRepository(body, url);
    if (result === true) {
      jsonData.setCode(SUCCESS_CODE);
      jsonData.setMessage('创建git仓库成功');
      jsonData.setData(url);
    }
    return jsonData.sendData();
  }
  @All(`${getGitRouterUrl()}/:projectName.git/*`)
  async repository(
    @Param('projectName') projectName: string,
    @Request() req,
    @Response() res,
  ) {
    const path = getGitRepositoryPath(projectName);
    const reqStream =
      req.headers['content-encoding'] == 'gzip'
        ? req.pipe(zlib.createGunzip())
        : req;
    reqStream
      .pipe(
        backend(req.url, async (err, service) => {
          if (err) return String(err);
          res.setHeader('content-type', service.type);
          const ps = spawn(service.cmd, service.args.concat(path));
          ps.stdout.pipe(service.createStream()).pipe(ps.stdin);
          ps.on('exit', () => {
            handleCommitAction(service, projectName, req);
          });
        }),
      )
      .pipe(res);
  }
}
