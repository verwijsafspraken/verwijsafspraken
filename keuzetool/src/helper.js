/**
 * This method allows for recursively looking through a JSON tree and return the path
 * @param obj Object (json blob or child)
 * @param path Current path of the key
 * @param arr Something...
 */
function recurse(obj, path = '', arr = []) {
  for (let key in obj) {
    let item = obj[key]
    let newPath = `${path}.${key}`

    if (typeof item == 'object') {
      recurse(item, newPath, arr)
    } else {
      if (key !== 'id' || typeof key !== 'number') {
        arr.push(newPath)
      }
    }
  }
  return arr
}