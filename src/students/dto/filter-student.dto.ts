import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class FilterStudentDto {
  @IsString()
  @IsOptional()
  career?: string;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  @Type(() => Number)
  semester?: number;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  isActive?: boolean;
}
