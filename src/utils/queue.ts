export interface PackageTask<T = any, Result = any> {
  /** 任务id */
  id: number;
  /** 执行任务 */
  task: (config: T) => Result;
  /** 任务参数 */
  config: T;
  /** 任务状态 0 未执行,1 执行中,2 执行结束 */
  status: 0 | 1 | 2;
}

export class Queue<T = any, Result = any> {
  /** 任务id 自增 */
  id = 0;
  /** 任务队列 */
  queue: PackageTask<T, Result>[] = [];
  /** 当前正在执行的任务 */
  taskQueue: PackageTask<T, Result>[] = [];
  /** 当前可执行的任务数量 */
  taskNum = 0;
  constructor(config: { taskNum?: number } = {}) {
    const { taskNum } = config;
    if (taskNum) {
      this.taskNum = taskNum;
    }
  }
  push<C>(task, config: C, callback) {
    const taskInfo = this.packageTask(task, config);
    this.queue.push(taskInfo);
    this.execute(callback);
  }
  packageTask(task, config): PackageTask<T, Result> {
    return {
      task,
      config,
      id: ++this.id,
      status: 0,
    };
  }
  execute(callback) {
    const pushNum = this.taskNum
      ? this.taskNum - this.taskQueue.length
      : this.taskQueue.length;
    if (pushNum <= 0) return;
    for (let i = 0; i < pushNum; i++) {
      const task = this.queue.shift();
      if (task) {
        this.taskQueue.push(task);
      }
    }
    this.taskQueue.forEach(async (taskInfo) => {
      if (taskInfo?.status === 0) {
        taskInfo.status = 1;
        const result = await taskInfo.task(taskInfo.config);
        callback?.(result);
        taskInfo.status = 2;
        this.taskQueue = this.taskQueue.filter((info) => info.status !== 2);
        this.execute(callback);
      }
    });
  }
}
