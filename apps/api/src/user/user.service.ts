import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: [
        'id',
        'username',
        'displayName',
        'email',
        'avatarUrl',
        'githubProfileUrl',
        'createdAt',
      ],
    });
  }

  async findOne(id: string): Promise<User> {
    return this.userRepository.findOneBy({ id });
  }
}
