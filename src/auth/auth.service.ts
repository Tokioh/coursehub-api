import { Injectable, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { UsersService, type UserResponse } from '../users/users.service.js';
import { CreateUserDto } from '../users/dto/create-user.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(registerDto: CreateUserDto): Promise<UserResponse> {
    return this.usersService.create(registerDto);
  }

  async login(loginDto: LoginDto): Promise<UserResponse> {
    const user = await this.usersService.findByEmailWithPassword(
      loginDto.email,
    );

    const genericErrorMessage = 'Credenciales inválidas';

    if (!user) {
      throw new UnauthorizedException(genericErrorMessage);
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(genericErrorMessage);
    }

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
