import { Column, Entity } from 'typeorm';
import { Role } from './user.enums';
import { AbstractBaseEntity } from '../common/common.pure.entity';

@Entity({ name: 'users' })
export class User extends AbstractBaseEntity {

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  bvn: string;

  @Column({ type: 'text', nullable: true })
  avatar: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ type: 'timestamp', nullable: true })
  dob: string;

  @Column({ nullable: true })
  country: string;

  @Column({ default: false })
  isFirstTimeLogin: boolean;

  @Column({ default: false })
  bvnVerified: boolean;

  @Column({ type: 'text', nullable: true })
  identityDocument: string;

  @Column({ default: false })
  identityDocument_verified: boolean;

  @Column({ nullable: true })
  employmentStatus: string;


  @Column({ type: 'double precision', scale: 2, precision: 20, nullable: true })
  monthlyNetSalary: string;

  @Column({ default: false })
  isNhfActive: boolean;

  @Column({ nullable: true })
  pfa: string;

  @Column({ nullable: true })
  rsa: string;

  @Column({ type: 'json' })
  roles: Role[];

  @Column({ nullable: true })
  businessSector: string;

  // @Column({
  //   type: 'enum',
  //   enum: ImageType,
  //   nullable: true,
  // })
  // identityDocumentType: ImageType;

  @Column({ type: 'integer', nullable: true })
  yearsOfWork: number;

  @Column({ default: false })
  suspended: boolean;
}
