import { ARRAY_TYPE, OBJECT_TYPE, UNION_TYPE } from '../types/nodeTypes'

function createCodegenContext() {
  const context = {
    code: '',
    indentLevel: 0,
    push(code: string) {
      context.code += code
    },
    indent() {
      newline(++context.indentLevel)
    },
    deindent(withoutNewLine = false) {
      if (withoutNewLine)
        --context.indentLevel
      else
        newline(--context.indentLevel)
    },
    newline() {
      newline(context.indentLevel)
    },
  }

  function newline(n: number) {
    context.push(`\n${'  '.repeat(n)}`)
  }

  return context
}

function genTsNode(ast: any, context: any) {
  const { push, indent, deindent, newline } = context
  const { type, children } = ast

  if (type === OBJECT_TYPE)
    push('{')
  else if (type === ARRAY_TYPE && children.length)
    push('Array<')

  for (const key in children) {
    const typeItem = children[key]

    switch (type) {
      case OBJECT_TYPE:
        indent()
        push(`${key}${typeItem.optional ? '?' : ''}: `)

        if (typeItem?.type)
          genTsNode(typeItem, context)
        else
          push(`${typeItem.dynamicType}`)

        deindent(true)
        break
      case ARRAY_TYPE:
      case UNION_TYPE:
        if (typeItem?.type)
          genTsNode(typeItem, context)
        else
          push(`${typeItem.dynamicType}`)

        if (Number(key) < children.length - 1)
          push(' | ')
        break
      default:
        push(`${typeItem}`)
    }
  }

  if (type === OBJECT_TYPE) {
    newline()
    push('}')
  }
  else if (type === ARRAY_TYPE) {
    children.length ? push('>') : push('[]')
  }
}

export function generate(ast: any, options: any) {
  const { typeName } = options
  const context = createCodegenContext()
  const { push } = context

  if (ast.type === OBJECT_TYPE)
    push(`export interface ${typeName} `)
  else if (ast.type === ARRAY_TYPE)
    push(`export type ${typeName} = `)

  if (ast.children)
    genTsNode(ast, context)
  else
    push(`${ast.children}`)

  return context.code
}
