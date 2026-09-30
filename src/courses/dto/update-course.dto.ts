import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateCourseDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsIn(['beginner', 'intermediate', 'advanced'])
  @IsOptional()
  level?: string;
}
