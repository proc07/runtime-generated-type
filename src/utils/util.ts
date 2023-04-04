export function toFirstUpperCase(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

export function toTypeof(val: any) {
  const s = Object.prototype.toString.call(val)
  return s!.match(/\[object (.*?)\]/)[1].toLowerCase()
}

export function detectionTypName(typeName: string) {
  const isInterface = `interface ${typeName} `
  const isType = `type ${typeName} `

  return function isExistTypeName(strData: string) {
    return strData.includes(isInterface) || strData.includes(isType)
  }
}
