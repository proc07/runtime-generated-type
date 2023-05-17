export const UNION_TYPE = 'Union Type'
export const ARRAY_TYPE = 'Array Type'
export const OBJECT_TYPE = 'Object Type'
export const PRIMITIVE_TYPE = 'Primitive Type'

interface PrimitiveTypeNode {
  dynamicType: string
  optional: boolean
}

interface ChildObjectTypeNode extends ObjectNode {
  optional: boolean
}
interface ChildArrayTypeNode extends ArrayNode {
  optional: boolean
}
type ChildTypeNode = ChildObjectTypeNode | ChildArrayTypeNode | {
  type: typeof UNION_TYPE
  optional: boolean
  children: ArrayNode['children']
}

export interface ArrayNode {
  type: typeof ARRAY_TYPE
  children: ChildTypeNode[] | PrimitiveTypeNode[]
}
export interface ObjectNode {
  type: typeof OBJECT_TYPE
  children: {
    [key in string]: ChildTypeNode | PrimitiveTypeNode
  }
}
export type RootTypeNode = ArrayNode | ObjectNode
