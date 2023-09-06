export function isDefine (input: any) {
  return input !== null && input !== undefined
}

export function isString (input: any) {
  return typeof input === 'string'
}

export function isBoolean (input: any) {
  return typeof input === 'boolean'
}

export function isNumber (input: any) {
  return typeof input === 'number'
}

export function isNaN (input: any) {
  return Number.isNaN ? Number.isNaN(input) : isNumber(input) && input.toString() === 'NaN'
}

export function isBigint (input: any) {
  return typeof input === 'bigint'
}

export function isSymbol (input: any) {
  return typeof input === 'symbol'
}

export function isFunction (input: any) {
  return typeof input === 'function'
}

export function isObject (input: any) {
  return typeof input === 'object' && input === Object(input)
}

export function isArray (input: any) {
  return Object.prototype.toString.call(input) === '[object Array]'
}

export function isDate (input: any) {
  return Object.prototype.toString.call(input) === '[object Date]'
}

export function isRegExp (input: any) {
  return Object.prototype.toString.call(input) === '[object RegExp]'
}

export function isPromise (input: any) {
  return Object.prototype.toString.call(input) === '[object Promise]'
}

export function isFormData (input: any) {
  return Object.prototype.toString.call(input) === '[object FormData]'
}

export function isEmpty (input: any) {
  if (!isDefine(input)) return true
  if (isString(input)) return /^\s*$/.test(input)
  if (isNaN(input)) return true
  if (isArray(input)) return input.length === 0
  if (isDate(input)) return input.toString() === 'Invalid Date'

  if (isObject(input)) {
    for (const _ in input) return false

    return true
  }

  return false
}

export function isMobileNumber (value: string): boolean {
  return /^1[3-9]\d{9}$/.test(value)
}

export function isTelNumber (value: string): boolean {
  return /^0\d{2,3}-?[2-9]\d{6,7}$/.test(value)
}

export function isPhoneNumber (value: string): boolean {
  return isMobileNumber(value) || isTelNumber(value)
}