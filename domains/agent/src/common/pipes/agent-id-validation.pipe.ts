import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class AgentIdValidationPipe implements PipeTransform {
  transform(value: any): number {
    // Check if value is undefined, null, or empty
    if (value === undefined || value === null || value === '') {
      throw new BadRequestException('Agent ID is required and cannot be empty');
    }

    // Check if value is 'undefined' string
    if (value === 'undefined') {
      throw new BadRequestException('Agent ID cannot be undefined. Please provide a valid agent ID.');
    }

    // Convert to number
    const id = parseInt(value, 10);

    // Check if conversion was successful
    if (isNaN(id)) {
      throw new BadRequestException(`Invalid agent ID: "${value}". Agent ID must be a valid number.`);
    }

    // Check if id is positive
    if (id <= 0) {
      throw new BadRequestException(`Invalid agent ID: ${id}. Agent ID must be a positive number.`);
    }

    return id;
  }
}
