import { Developer } from '../../developer/developer.entity';
import { ProposedDevelopment } from '../../proposed-development/proposed-development.entity';
import { getMetadataArgsStorage } from 'typeorm';

export default class EntityHelper {
  // eslint-disable-next-line @typescript-eslint/ban-types
  public static getEntityFields(entityClass: Function) {
    const fields: string[] = [];

    // Get metadata for the entity class
    const metadata = getMetadataArgsStorage();

    // Iterate over all columns (fields) defined for the entity
    metadata.columns.forEach((column) => {
      // Check if the column's target (entity) matches the provided entity class
      if (column.target === entityClass) {
        fields.push(column.propertyName);
      }
    });

    // Iterate over all relations defined for the entity
    // metadata.relations.forEach((relation) => {
    //   // Check if the relation's target (entity) matches the provided entity class
    //   if (relation.target === entityClass) {
    //     fields.push(relation.propertyName);
    //   }
    // });

    return fields;
  }

  public static getProposedDevelopmentFields() {
    const allFields = this.getEntityFields(ProposedDevelopment);

    const sanitized = allFields.filter(
      (field) => !['createdAt', 'updatedAt', 'deletedAt', 'id'].includes(field),
    );

    return sanitized;
  }

  public static getDeveloperFields() {
    const allFields = this.getEntityFields(Developer);

    const sanitized = allFields.filter(
      (field) =>
        !['createdAt', 'updatedAt', 'deletedAt', 'id', 'user'].includes(field),
    );

    return [...sanitized, 'userId'];
  }

  /**
   * @example
   * async updateOneWithRelationships(
    id: number,
    updateDeveloperDto: UpdateDeveloperDto,
  ): Promise<Developer> {
    const developer = await this.developerRepository.findOneBy({ id: id });

    if (!developer) {
      throw new NotFoundException(`Developer with ID ${id} not found`);
    }

    //----

    const proposedDevelopmentFields =
      EntityHelper.getProposedDevelopmentFields();

    if (proposedDevelopmentFields.length > 0) {
      const proposedDevelopmentDto = EntityHelper.filterObjectByFields(
        updateDeveloperDto,
        proposedDevelopmentFields,
      );

      if (developer.proposedDevelopment) {
        const proposedDevelopment = developer.proposedDevelopment;
        this.proposedDevelopmentRepository.update(
          proposedDevelopment.id,
          proposedDevelopmentDto,
        );
      } else {
        const newPD = await this.proposedDevelopmentRepository.save(
          proposedDevelopmentDto,
        );
        developer.proposedDevelopment = newPD;
        this.developerRepository.merge(developer, {
          proposedDevelopment: newPD,
        });
      }
    }

    this.developerRepository.merge(developer, updateDeveloperDto);
    //----

    return this.developerRepository.save(developer);
  }
   * 
   * @param inputObject 
   * @param fields 
   * @returns 
   */
  public static filterObjectByFields<T extends Record<string, any>>(
    inputObject: T,
    fields: string[],
  ) {
    const result = {};

    fields.forEach((field) => {
      if (inputObject.hasOwnProperty(field)) {
        result[field] = inputObject[field];
      }
    });

    return result;
  }
}
