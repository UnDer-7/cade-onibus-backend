export function isEquals(objectA: object, objectB: object): boolean {
  return Object.keys(objectA).every((item, index) => {
    return item === Object.keys(objectB)[index];
  })
}
