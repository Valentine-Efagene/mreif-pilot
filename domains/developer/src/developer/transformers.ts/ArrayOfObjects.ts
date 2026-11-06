import { ValueTransformer } from 'typeorm';

export class ArrayOfObjectsTransformer<T> implements ValueTransformer {
  to(value: T): string {
    return JSON.stringify(value);
  }

  from(value: string): T {
    return JSON.parse(value);
  }
}
