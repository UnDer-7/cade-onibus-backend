export class ConvertToEntity {
  /**
   * Convert a given Object to an Entity
   * @param entity
   */
  public static convert<T>(entity: T): T {
    return Object.assign({}, entity);
  }

  /**
   * Convert a given Array of Object to an Array of Entity
   * @param entities[]
   */
  public static convertMany<T>(entities: T[]): T[] {
    return entities.map(item => {
      return ConvertToEntity.convert<T>(item);
    })
  }
}
