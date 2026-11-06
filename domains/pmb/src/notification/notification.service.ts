import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class NotificationService {
  constructor(
    private readonly httpService: HttpService,
    //private readonly logger = new Logger(NotificationService.name)
  ) { }

  async sendEmployeeInvite(email: string, nhfNumber: string): Promise<any> {
    const apiUrl = `${process.env.api_base_url}/notify`;

    const payload = {
      subject: "Employee Invitation",
      message: `Join us ${nhfNumber}`,
      to_email: email
    };

    const { data } = await firstValueFrom(
      this.httpService.post(apiUrl, payload)
        .pipe(catchError((error: AxiosError) => {
          console.log(error)
          //this.logger.error(error.response.data);
          throw 'Notification Error!';
        }))
    )

    return data
  }

  async sendEmployeeInviteViaSms(phoneNumber: string, nhfNumber: string): Promise<any> {
    const apiUrl = `${process.env.mailer_url}/send-sms`;

    const payload = {
      message: `Join us ${nhfNumber}`,
      phone_number: phoneNumber
    };

    const { data } = await firstValueFrom(
      this.httpService.post(apiUrl, payload)
        .pipe(catchError((error: AxiosError) => {
          console.log(error)
          //this.logger.error(error.response.data);
          throw 'Notification Error!';
        }))
    )

    return data
  }
}
