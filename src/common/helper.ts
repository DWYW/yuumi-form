export function randomString(): string {
  const str = Math.random().toString(16)
  return str.toString().slice(2, 5) + Date.now().toString(32) + str.toString().slice(5, 10)
}

export function setPropertyValue<T>(target: any, path: string, value: T) {
  const paths: string[] = path.match(/\w+/g) || []
  if (paths.length === 0) return

  let obj = target
  while (paths.length > 1) {
    if (typeof obj !== "object") break

    const property = paths.shift() as string
    obj = obj[property]
  }

  if (typeof obj !== "object") return

  const property = paths.shift() as string
  obj[property] = value
}

/**
 * 深拷贝
 * @param data {object|array} 要拷贝的值
 */
export function deepCopy<T>(data: T): T {
  if (!data || !(data instanceof Object) || data instanceof Function) return data

  const copy: any = data instanceof Array ? [] : {}
  const copyed = [{
    origin: data,
    copy: copy
  }]

  const foreach = (stackItem: any) => {
    const { origin, copy } = stackItem

    // 依次访问本层属性
    for (const key in origin) {
      const item = origin[key]

      if (!(item instanceof Object) || item instanceof Function) {
        copy[key] = item
        continue
      }

      // 检测当前值是否被拷贝过
      const _copyed = copyed.find(t => t.origin === item)
      if (_copyed) {
        copy[key] = _copyed.copy
        continue
      }

      copy[key] = item instanceof Array ? [] : {}

      // 用于下一次判断，防止循环引用造成的溢出
      copyed.push({
        origin: item,
        copy: copy[key]
      })

      foreach({
        origin: item,
        copy: copy[key]
      })
    }
  }

  foreach({
    origin: data,
    copy: copy
  })

  return copy
}
