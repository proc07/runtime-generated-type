export function toFirstUpperCase(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

export function toTypeof(val: any) {
  const s = Object.prototype.toString.call(val)
  const typeRes = s!.match(/\[object (.*?)\]/)

  return typeRes && typeRes[1].toLowerCase()
}

export function isAllNumbers(str: string) {
  return /^\d+$/.test(str)
}

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isUUID(str: string) {
  return uuidRegex.test(str)
}
