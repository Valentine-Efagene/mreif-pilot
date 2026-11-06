import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('database')
@ApiTags('DB Admin')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('synchronize')
  async synchronizeDatabase() {
    await this.databaseService.synchronizeDatabase();
    return 'Database synchronized successfully';
  }
}
