import { HttpException, HttpStatus } from '@nestjs/common';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidationOptions, registerDecorator } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { UserType } from './common.enum';

export class GetListDto {
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({ required: false })
  page: string | any;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  isActive: string;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({ required: false })
  @IsInt()
  year?: number;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({ required: false })
  limit: string | any;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: false })
  sort: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: false })
  sortDirection: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  search: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false })
  skip?: number;

  @IsOptional()
  @IsString()
  role: string;
}

export class FindUserListDto extends GetListDto {
  @IsEnum(UserType)
  @IsOptional()
  userType: UserType

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  passwordReset: string
}
export class GetDataByIdDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;
}

// export function IsNonPrimitiveArray(validationOptions?: ValidationOptions) {
//   return function (object: any, propertyName: string) {
//     registerDecorator({
//       name: 'IsNonPrimitiveArray',
//       target: object.constructor,
//       propertyName,
//       constraints: [],
//       options: validationOptions,
//       validator: {
//         validate(value: any) {
//           if (value && Array.isArray(value)) {
//             return value.reduce(function (a, b) {
//               return a && typeof b === 'object' && !Array.isArray(b);
//             }, true);
//           } else {
//             throw new HttpException(`${propertyName} must be a valid ${propertyName} array.`, HttpStatus.BAD_REQUEST);
//           }
//         },
//       },
//     });
//   };
// }

export interface InsertManyResult {
  insertedCount: number;
  insertedIds: string[];
}

export class WithoutResponseDto {
  @IsBoolean()
  @ApiProperty({ description: 'The response status.' })
  declare status: boolean;

  @IsNumber()
  @ApiProperty({ description: 'The response status code.', example: HttpStatus.OK })
  declare statusCode: number;

  @IsNumber()
  @ApiProperty({ description: 'The response count of documents.', example: 0 })
  declare count: number;

  @IsString()
  @ApiProperty({
    description: 'The filePath associated with the response.',
    example: '',
  })
  declare filePath: string;
}

export class ResponseDto extends WithoutResponseDto {
  @IsObject()
  @IsOptional()
  @ApiProperty({
    example: [],
    required: false,
    description: 'The data associated with the response.',
  })
  declare data: [];
}

export class ErrorResponseDto {
  @IsBoolean()
  @ApiProperty({ description: 'The response status.', default: false })
  declare status: boolean;

  @IsNumber()
  @ApiProperty({ description: 'The response status code.' })
  declare statusCode: number;

  @IsObject()
  @ApiProperty({
    description: 'The data associated with the response.',
    example: [],
  })
  declare data: [];
}

export class UserStatusUpdateDto extends GetDataByIdDto {
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
