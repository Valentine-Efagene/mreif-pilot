//import { registerEnumType } from "@nestjs/graphql";

export enum UserRole {
  ADMIN = 'admin',
  DEVELOPER = 'rsa',
  SALES_ADMIN = 'sales_admin',
  FINANCE_ADMIN = 'finance_admin',
  SUPER_ADMIN = 'super_admin',
  PMB = 'rsa',
}


export enum ImageTypes {
  JPEG = 'jpeg',
  JPG = 'jpg',
  PNG = 'png',
  PDF = 'pdf',
}

export enum MaritalStatus {
  MARRIED = 'Married',
  SINGLE = 'Single',
  DIVORCED = 'Divorced'
}