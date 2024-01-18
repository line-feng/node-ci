/**
 * 选择自己需要的校验器
 * https://github.com/typestack/class-validator#validation-decorators
 */
import { Matches, IsNotEmpty } from 'class-validator';
import { FOLDER_SPECIAL_CHARACTER } from '../../utils/common';

export class GitCreate {
  @IsNotEmpty({ message: '项目名不能为空' })
  @Matches(new RegExp(`^[^${FOLDER_SPECIAL_CHARACTER}]+$`, 'g'), {
    message: '不能包含特殊字符',
  })
  projectName: string;
  remote: boolean;
}
