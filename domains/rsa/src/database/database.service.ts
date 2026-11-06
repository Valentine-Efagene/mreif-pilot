// database.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Connection } from 'typeorm';

@Injectable()
export class DatabaseService {
  constructor(private readonly connection: Connection) { }


  async synchronizeDatabase() {
    const env = process.env.db_host

    if (env !== 'localhost') {
      throw new UnauthorizedException()
    }

    await this.connection.synchronize(true);
  }
}
