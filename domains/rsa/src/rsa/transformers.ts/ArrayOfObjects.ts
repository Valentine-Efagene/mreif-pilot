import { ValueTransformer } from 'typeorm';

export class ArrayOfObjectsTransformer<T> implements ValueTransformer {
  to(value: T): string {
    console.log({ valueTo: value });
    return JSON.stringify(value);
  }

  from(value: string): T {
    console.log({ valueFrom: value });
    return JSON.parse(value);
  }
}
