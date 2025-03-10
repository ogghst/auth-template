import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
    length: 100,
  })
  name: string;

  @Column({ unique: true, nullable: true })
  githubId: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  displayName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  githubProfileUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
