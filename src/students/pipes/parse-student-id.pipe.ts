import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParseStudentIdPipe implements PipeTransform<string, number> {
  transform(value: string, _metadata: ArgumentMetadata): number {
    const parsedId = parseInt(value, 10);
    if (isNaN(parsedId) || parsedId <= 0) {
      throw new BadRequestException(
        `El parámetro id '${value}' debe ser un número entero positivo válido`,
      );
    }
    return parsedId;
  }
}
