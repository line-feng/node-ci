import * as path from 'node:path';
import { exec } from 'child_process';
import { isWindows } from 'utils/common';
import { createFile, deleteFolder } from 'utils/node/fs';
import { decode } from 'iconv-lite';
const encoding = isWindows() ? 'cp936' : 'utf-8';
const binaryEncoding = 'binary';

export interface Commands {
  command: string;
  cwd: string;
  callback?: (
    value?: boolean,
  ) => undefined | boolean | void | Promise<undefined | boolean | void>;
  async?: boolean;
}

interface CommandStaticType {
  command: string;
  cwd: string;
  arg1: string;
  arg2: string;
}

export const commandsFormat = (command: string): string[] =>
  command.replace(/\s+/g, ' ').split(' ');

export const execTaskAsync = (commands: Commands[]): Promise<boolean[]> => {
  return new Promise(async (resolve) => {
    let taskNum = commands.length;
    const list: boolean[] = new Array(taskNum).fill(true);
    for (let i = 0; i < commands.length; i++) {
      const item = commands[i];
      if (item.async) {
        const result = await execCommand(item);
        if (item.callback) {
          const value = await item.callback(result);
          // 回调返回false中断后续逻辑
          if (value === false) break;
        }
        // 同步命令执行失败，中断后续逻辑
        if (result === false) break;
        list[i] = result;
        taskNum -= 1;
        if (taskNum <= 0) {
          resolve(list);
        }
      } else {
        execCommand(item).then((result) => {
          item.callback && item.callback(result);
          taskNum -= 1;
          if (taskNum <= 0) {
            resolve(list);
          }
        });
      }
    }
  });
};

class commandStaticClass {
  static async touch(config: Pick<CommandStaticType, 'cwd' | 'arg1'>) {
    const { cwd, arg1 } = config;
    const result = await createFile(path.resolve(cwd, arg1));
    return result;
  }
  static async rm(config: Pick<CommandStaticType, 'cwd' | 'arg1' | 'arg2'>) {
    const { cwd, arg2 } = config;
    const result = await deleteFolder(path.resolve(cwd, arg2));
    return result;
  }
  static async exec(
    config: Pick<CommandStaticType, 'command' | 'cwd'>,
  ): Promise<boolean> {
    const { command, cwd } = config;
    const [prefix, arg1, arg2] = commandsFormat(command);
    return commandStaticClass[prefix]({ cwd, arg1, arg2 });
  }
  static has({ command }: Pick<CommandStaticType, 'command'>) {
    const [prefix] = commandsFormat(command);
    return !['exec', 'has'].includes(prefix) && !!this[prefix];
  }
}

export const execCommand = (
  commands: Omit<Commands, 'async'>,
): Promise<boolean> => {
  return new Promise(async (resolve) => {
    const { command, cwd } = commands;
    const startTime = Date.now();
    console.log(command, '--start');
    try {
      //
      if (isWindows() && commandStaticClass.has({ command })) {
        const result = commandStaticClass.exec({ command, cwd });
        console.log(command, '--done', `${Date.now() - startTime}ms`);
        return resolve(result);
      }
      exec(command, { cwd, encoding: binaryEncoding }, (error, stdout) => {
        if (error) {
          console.log(
            decode(Buffer.from(stdout, binaryEncoding), encoding),
            decode(Buffer.from(error.message, binaryEncoding), encoding),
          );
          return resolve(false);
        }
        if (stdout?.length) {
          console.log(decode(Buffer.from(stdout, binaryEncoding), encoding));
        }
        console.log(command, '--done', `${Date.now() - startTime}ms`);
        return resolve(true);
      });
    } catch (error) {
      console.log(decode(Buffer.from(error.message, binaryEncoding), encoding));
      return resolve(false);
    }
  });
};

export const filterCommands = (commands: string[], prefix: string) => {
  return commands.filter((command) => {
    const [cmd] = commandsFormat(command);
    return cmd === prefix;
  });
};
