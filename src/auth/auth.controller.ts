import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UsersService, type UserResponse } from '../users/users.service.js';
import { CreateUserDto } from '../users/dto/create-user.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDto: CreateUserDto): Promise<UserResponse> {
    return this.usersService.create(registerDto);
  }
}
