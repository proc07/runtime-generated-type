import { toTypeof } from '../utils/util'
import type { ArrayNode, ObjectNode, RootTypeNode } from '../types/nodeTypes'
import { ARRAY_TYPE, OBJECT_TYPE, UNION_TYPE } from '../types/nodeTypes'

export function createTypeAst(resData: unknown): RootTypeNode | null {
  const valType = toTypeof(resData)
  return valType === 'array'
    ? createArrayType()
    : valType === 'object'
      ? createObjectType()
      : null
}

function createArrayType(): ArrayNode {
  return {
    type: ARRAY_TYPE,
    children: [],
  }
}
function createObjectType(): ObjectNode {
  return {
    type: OBJECT_TYPE,
    children: {},
  }
}
function createDynamicType(valType: string, optional?: boolean) {
  return {
    dynamicType: valType,
    optional: optional || false,
  }
}

export function baseParse(resData: any, ast: any) {
  const { type, children } = ast
  const prevChildKeys = Object.keys(children)

  for (const key in resData) {
    const value = resData[key] // key as number | string
    const valType = toTypeof(value)

    if (valType === 'object') {
      let useTypeObject = createObjectType()

      if (type === OBJECT_TYPE) {
        if (children[key]?.type === OBJECT_TYPE) {
          // case: prev valType object
          useTypeObject = children[key]
        }
        else if (children[key]?.type === UNION_TYPE) {
          const [childObject] = children[key].children.filter((item: any) => item?.type === OBJECT_TYPE)

          if (childObject)
            useTypeObject = childObject
          else
            children[key].children.push(useTypeObject)
        }
        else if (children[key]) {
          // case: prev valType array|string|number..., next valType object
          const prevOptional = children[key]?.optional

          children[key] = {
            type: UNION_TYPE,
            optional: prevOptional,
            children: [children[key], useTypeObject],
          }
        }
        else {
          children[key] = useTypeObject
        }
      }
      else if (type === ARRAY_TYPE) {
        const index = children.findIndex((item: any) => item?.type === OBJECT_TYPE)

        if (index !== -1)
          useTypeObject = children[index]
        else
          children.push(useTypeObject)
      }

      baseParse(value, useTypeObject)
    }
    else if (valType === 'array') {
      let useTypeArray: any = createArrayType()

      if (type === OBJECT_TYPE) {
        if (children[key]?.type === ARRAY_TYPE) {
          useTypeArray = children[key]
        }
        else if (children[key]?.type === UNION_TYPE) {
          const [childArray] = children[key].children.filter((item: any) => item?.type === ARRAY_TYPE)

          if (childArray)
            useTypeArray = childArray
          else
            children[key].children.push(useTypeArray)
        }
        else if (children[key]) {
          // case: prev valType object|string|number...
          const prevOptional = children[key]?.optional
          children[key] = {
            type: UNION_TYPE,
            optional: prevOptional,
            children: [children[key], useTypeArray],
          }
        }
        else {
          children[key] = useTypeArray
        }
      }
      else if (type === ARRAY_TYPE) {
        const index = children.findIndex((item: any) => item?.type === ARRAY_TYPE)

        if (index !== -1)
          useTypeArray = children[index]
        else
          children.push(useTypeArray)
      }

      value.forEach((subVal: any) => {
        baseParse([subVal], useTypeArray)
      })
    }
    else {
      if (children[key]) {
        const { type: _type, children: _children } = children[key]

        if (isArrayType(_type)) {
          const fIndex: number = _children.findIndex((item: any) => (item.dynamicType) === valType)

          if (fIndex === -1)
            _children.push(createDynamicType(valType))
        }
        else if (_type === OBJECT_TYPE || children[key].dynamicType !== valType) {
          const prevOptional = children[key]?.optional

          children[key] = {
            type: UNION_TYPE,
            optional: prevOptional,
            children: [children[key], createDynamicType(valType, prevOptional)],
          }
        }
      }
      else {
        // set object value Type
        children[key] = createDynamicType(valType)
      }
    }
  }

  if (type === OBJECT_TYPE) {
    const nextChildKeys = Object.keys(resData)
    if (prevChildKeys.length) {
      // Remove Duplicates
      const nextRes = nextChildKeys.filter(nKey => !prevChildKeys.includes(nKey))
      const prevRes = prevChildKeys.filter(pKey => !nextChildKeys.includes(pKey))
      const childKeys = prevRes.concat(nextRes)

      childKeys.forEach(key => setEnableOptional(children[key]))
    }
  }
}

function setEnableOptional(childItem: any) {
  childItem.optional = true

  if (isArrayType(childItem?.type)) {
    childItem.children.forEach((item: any) => {
      setEnableOptional(item)
    })
  }
}

function isArrayType(type: string) {
  return type === ARRAY_TYPE || type === UNION_TYPE
}
