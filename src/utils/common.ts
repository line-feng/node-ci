/** 文件夹特殊字符 */
export const FOLDER_SPECIAL_CHARACTER = '\\/:*?"<>|';

export const isNull = (value: unknown): boolean => value === null;
export const isUndefined = (value: unknown): boolean => value === undefined;
export const isNullString = (value: unknown): boolean => value === '';

export const checkValueNull = (value: unknown) =>
  isNull(value) || isUndefined(value) || isNullString(value);

export const isWindows = () => process.platform === 'win32';

export const decodeBuffer = (buffer, encoding) => {
  const decoder = new TextDecoder(encoding);
  return decoder.decode(buffer);
};

export const isPord = () => process.env.NODE_ENV === 'production';
