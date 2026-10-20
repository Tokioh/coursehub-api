import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { User } from './entities/user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';

export interface UserResponse {
  id: number;
  email: string;
  createdAt: Date;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponse> {
    const normalizedEmail = createUserDto.email.trim().toLowerCase();

    const existingUser = await this.usersRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException(
        `El correo electrónico '${normalizedEmail}' ya se encuentra registrado`,
      );
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(createUserDto.password, saltRounds);

    try {
      const user = this.usersRepository.create({
        email: normalizedEmail,
        passwordHash,
      });

      const savedUser = await this.usersRepository.save(user);

      return {
        id: savedUser.id,
        email: savedUser.email,
        createdAt: savedUser.createdAt,
      };
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new ConflictException(
          `El correo electrónico '${normalizedEmail}' ya se encuentra registrado`,
        );
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email.trim().toLowerCase() },
    });
  }
}
