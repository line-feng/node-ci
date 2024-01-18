import {
  execTaskAsync,
  execCommand,
  filterCommands,
  Commands,
} from 'utils/node/exec';
import {
  getGitOriginUrl,
  getGitRepositoryPath,
  gitTempFolder,
  getRunjs,
} from 'utils/git/git.config';

interface Fields {
  head: string;
  last: string;
  refname: string;
  ref: string;
  name: string;
  branch: string;
}
interface GitServiceInfo {
  action: 'info' | 'push';
  _backend: any;
  fields: Fields;
  createStream: () => void;
}

interface NodeCiType {
  branch: string;
  run: string[];
}

const nodeCiJsMapHook = () => {
  const map = new Map();
  const setMap = (key, path) => {
    map.set(key, path);
  };
  const getMap = async (key: string, path: string): Promise<NodeCiType> => {
    if (!map.has(key)) {
      try {
        // 使用require读取js文件数据，import不支持清除缓存
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const result = require(path);
        const nodeCacheKey = require.resolve(path);
        delete require.cache[nodeCacheKey]; // 清除模块缓存
        if (typeof result === 'object') {
          setMap(key, result);
        }
      } catch (error) {}
    }
    return map.get(key) || {};
  };
  return {
    map,
    getMap,
  };
};

export const handleCommitAction = async (
  serviceInfo: GitServiceInfo,
  projectName: string,
  req,
) => {
  const head = serviceInfo.fields.head;
  const branch = serviceInfo.fields.branch;
  const { getMap } = nodeCiJsMapHook();
  switch (serviceInfo.action) {
    case 'push': {
      const fileUrl = getGitRepositoryPath(projectName);
      const origin = getGitOriginUrl(req, projectName);
      const { rootPath, execPath } = gitTempFolder(fileUrl, head);
      const clonePath = `${execPath}/${projectName}`;
      const runJsPath = `${rootPath}/${getRunjs()}`;
      execTaskAsync([
        {
          command: `mkdir ${execPath}`,
          cwd: fileUrl,
          async: true,
        },
        {
          command: `git show ${head}:${getRunjs()} > ../${getRunjs()}`,
          cwd: execPath,
          async: true,
          async callback(value) {
            if (value) {
              const json = await getMap(head, runJsPath);
              if (branch === json.branch) {
                return;
              }
            }
            execCommand({
              command: `rm -rf ${rootPath}`,
              cwd: fileUrl,
            });
            return false;
          },
        },
        {
          command: `git clone ${origin}`,
          cwd: execPath,
          async: true,
          async callback(value) {
            const json = await getMap(head, runJsPath);
            if (value) {
              const filterCmd = filterCommands(json.run || [], 'npm');
              const taskCmd: Commands[] = filterCmd?.map((cmd) => ({
                command: cmd,
                cwd: clonePath,
                async: true,
                callback(value) {
                  if (!value) {
                    // execCommand({
                    //   command: `rm -rf ${rootPath}`,
                    //   cwd: fileUrl,
                    // });
                  }
                },
              }));
              await execTaskAsync(taskCmd);
            }
          },
        },
        // {
        //   command: `rm -rf ${rootPath}`,
        //   cwd: fileUrl,
        // },
      ]);
      break;
    }
  }
};
