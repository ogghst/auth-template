import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('tokens')
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  jti: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  revoked: boolean;

  @Column({ nullable: true })
  revokedAt: Date;

  @Column({ type: 'simple-json', nullable: true })
  metadata: {
    createdAt: Date;
    userAgent?: string;
    ipAddress?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
