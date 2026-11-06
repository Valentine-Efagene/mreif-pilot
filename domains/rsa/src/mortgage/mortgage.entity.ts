import { User } from '../user/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'new_mortgage_applications' })
export class Mortgage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.mortgages, {
    // eager: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: number
}