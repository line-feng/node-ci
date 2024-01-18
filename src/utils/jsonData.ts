export interface JsonDataType<T = any> {
  code: number;
  data: T;
  message: string;
}

export class JsonData<T = any> {
  private code = 200;
  private data: T = null;
  private message = 'success';
  private total: number = null;
  private currPage: number = null;

  getCode(): number {
    return this.code;
  }
  setCode(code: number) {
    this.code = code;
  }
  getData(): T {
    return this.data;
  }
  setData(data: T) {
    this.data = data;
  }
  getMessage(): string {
    return this.message;
  }
  setMessage(message: string) {
    this.message = message;
  }
  getTotal(): number {
    return this.total;
  }
  setTotal(total: number) {
    this.total = total;
  }
  getCurrPage(): number {
    return this.currPage;
  }
  setCurrPage(currPage: number) {
    this.currPage = currPage;
  }
  sendData(): JsonDataType<T> {
    return {
      code: this.code,
      data: this.data,
      message: this.message,
    };
  }
}
