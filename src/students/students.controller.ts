import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { StudentsService } from './students.service.js';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';
import { FilterStudentDto } from './dto/filter-student.dto.js';
import { UpdateStatusDto } from './dto/update-status.dto.js';
import { ParseStudentIdPipe } from './pipes/parse-student-id.pipe.js';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  findAll(@Query() filterStudentDto: FilterStudentDto) {
    return this.studentsService.findAll(filterStudentDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseStudentIdPipe) id: number) {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseStudentIdPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseStudentIdPipe) id: number,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.studentsService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseStudentIdPipe) id: number) {
    return this.studentsService.remove(id);
  }
}
