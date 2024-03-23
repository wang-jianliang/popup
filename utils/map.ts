export function mapToArray(map: Map<any, any>): Array<[any, any]> {
  return Array.from(map.entries());
}

export function arrayToMap(array: Array<[any, any]>): Map<any, any> {
  return new Map(array);
}
