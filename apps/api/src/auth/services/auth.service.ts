import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { AuthResponseDto } from '../dtos/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async handleGithubUser(githubUser: any): Promise<boolean> {
    // Check if user exists
    let user = await this.usersRepository.findOne({
      where: { githubId: githubUser.id },
    });

    // If not, create a new user
    if (!user) {
      user = this.usersRepository.create({
        githubId: githubUser.id,
        email: githubUser.email,
        username: githubUser.username || githubUser.login,
        displayName: githubUser.name,
        avatarUrl: githubUser.avatar_url,
        githubProfileUrl: githubUser.html_url,
        name: githubUser.name || githubUser.login,
      });

      await this.usersRepository.save(user);
      return true; // New user
    }

    // Update user information if needed
    if (
      user.email !== githubUser.email ||
      user.displayName !== githubUser.name ||
      user.avatarUrl !== githubUser.avatar_url
    ) {
      user.email = githubUser.email;
      user.displayName = githubUser.name;
      user.avatarUrl = githubUser.avatar_url;
      await this.usersRepository.save(user);
    }

    return false; // Existing user
  }

  async getUserProfile(userId: string): Promise<AuthResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      githubProfileUrl: user.githubProfileUrl,
    };
  }

  async validateUserById(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    return user;
  }
}
