/**
 * This method allows for recursively looking through a JSON tree and return the path
 * @param obj Object (json blob or child)
 * @param path Current path of the key
 * @param arr Something...
 */
function recurse(obj, path = '', arr = []) {
  console.log('new Call')
  for (let key in obj) {
    console.log('fKey: ', key)
    let item = obj[key]
    let newPath = `${path}.${key}`

    if (typeof item == 'object') {
      console.log('HERE')
      recurse(item, newPath, arr)
    } else {
      console.log('Key: ', key, 'Type: ', typeof key)
      if (key !== 'id' || typeof key !== 'number') {
        arr.push(newPath)
      }
    }
  }
  return arr
}