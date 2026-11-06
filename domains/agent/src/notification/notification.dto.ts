import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsUrl } from 'class-validator';
import { App } from './notification.enums';
import { Transform } from 'class-transformer';


const mock = {
  firstName: 'Johnny',
  otp: '4343',
  platform: 'Hope',
  serviceType: 'Inspection',
  customerName: 'Johnny Ufuoma',
  buyersName: 'Johnny Ufuoma',
  customerPhone: '+43435353434',
  rcNumber: '3435353434',
  contactInfo: '+43435353434',
  buyersPhone: '+43435353434',
  amenities: 'CCTV, Water heater',
  phone: '+43435353434',
  customerEmail: 'janedoe@testmail.com',
  email: 'janedoe@testmail.com',
  propertyDetails: '4 bedroom semi-detached duplex',
  propertyTitle: '4 bedroom semi-detached duplex',
  buyersEmail: 'janedoe@testmail.com',
  mortgageType: 'Commercial',
  propertyInfo: '4 bedroom semi-detached duplex',
  propertyCost: 400000000,
  loanAmount: 400000000,
  equityAmount: 400000000,
  developerName: 'Homes',
  batchNumber: 111,
  numberOfApplications: 332,
  modeOfInspection: 'Virtual',
  virtualOrPhysical: 'Virtual',
  amount: 400000000,
  preferredMortgageBank: 'Homebase',
  requestId: 121,
  applicationNumber: 1200,
  url: 'https://www.w3.org/Provider/Style/dummy.html',
  dashboardLink: 'https://www.w3.org/Provider/Style/dummy.html',
  companyWebsite: 'https://example.com',
  projectLocation: 'Karsana, Abuja',
  projectName: 'Karsana, Abuja',
  propertyAddress: 'Karsana, Abuja',
  dateAndTime: '03-04-2024 10:32',
  location: 'Karsana, Abuja',
  city: 'Abuja',
  state: 'FCT',
  date: '04-03-2024',
  time: '10:33',
  propertyType: 'duplex',
  duration: 100,
  declineReason: 'Anim laboris pariatur voluptate incididunt esse mollit qui est.',
  supportEmail: 'homebase@info.ng',
  supportPhone: '+45454656565',
  interestRate: 10,
  percentage: 10,
  username: 'janedoe',
  timeFrame: '24 hours',
}


export class BaseTemplateEmailDto {
  @ApiProperty({
    example: App.CONTRIBUILD,
    enum: App,
    type: 'enum'
  })
  @IsEnum(App)
  app: App;

  @ApiProperty({
    example: "efagenevalentine@gmail.com",
  })
  @IsEmail()
  to_email: string;
}

export class AgentApprovedRegistrationDto extends BaseTemplateEmailDto {
  @ApiProperty({ example: mock.developerName })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: mock.dashboardLink })
  @IsNotEmpty()
  @Transform(({ value }) => encodeURI(value))
  @IsUrl()
  loginLink: string;
}

export class AgentDeclinedRegistrationDto extends BaseTemplateEmailDto {
  @ApiProperty({ example: mock.developerName })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Dolore veniam ut consectetur dolor.' })
  @IsNotEmpty()
  reason: string;
}

export class AgentOnboardingCompletedDto extends BaseTemplateEmailDto {
  @ApiProperty({ example: mock.developerName })
  @IsNotEmpty()
  firstName: string;
}

export class HomeOwnerOnboardingCompleteDto extends BaseTemplateEmailDto {
  @ApiProperty({ example: mock.firstName })
  @IsNotEmpty()
  firstname: string;

  @ApiProperty({ example: mock.dashboardLink })
  @IsNotEmpty()
  @Transform(({ value }) => encodeURI(value))
  @IsUrl()
  loginLink: string;
}

export interface INotificationResponse {
  message: string,
  statusCode: number,
  data: {
    message: string,
    statusCode: number,
    success: boolean,
    data: {
      $metadata: {
        httpStatusCode: number,
        requestId: string,
        attempts: number,
        totalRetryDelay: number
      },
      MD5OfMessageBody: string,
      MessageId: string
    }
  }
}