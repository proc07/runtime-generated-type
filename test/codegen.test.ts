import { describe, expect, it } from 'vitest'
import { generate } from '../src/compile/codegen'

describe('compile convert the ast data structure into ts code', () => {
  it('check that the Object Type data is converted to ts code', () => {
    const ast = {
      type: 'Object Type',
      children: {
        msg: {
          dynamicType: 'string',
          optional: false,
        },
        data: {
          type: 'Array Type',
          children: [
            {
              type: 'Object Type',
              children: {
                a: {
                  type: 'Array Type',
                  children: [
                    {
                      type: 'Union Type',
                      optional: false,
                      children: [
                        {
                          dynamicType: 'number',
                          optional: false,
                        },
                        {
                          dynamicType: 'string',
                          optional: false,
                        },
                        {
                          dynamicType: 'boolean',
                          optional: false,
                        },
                      ],
                    },
                  ],
                },
              },
            },
          ],
        },
        code: {
          dynamicType: 'number',
          optional: false,
        },
      },
    }
    const { exportCode } = generate(ast, {
      typeName: 'ObjectResType',
    })

    expect(exportCode).toEqual(`export interface ObjectResType {
  msg: string
  data: Array<{
    a: Array<number | string | boolean>
  }>
  code: number
}`)
  })

  it('check that the Array Type data is converted to ts code', () => {
    const ast = {
      type: 'Array Type',
      children: [
        {
          type: 'Object Type',
          children: {
            a: {
              type: 'Array Type',
              children: [
                {
                  type: 'Union Type',
                  optional: false,
                  children: [
                    {
                      dynamicType: 'number',
                      optional: false,
                    },
                    {
                      dynamicType: 'string',
                      optional: false,
                    },
                    {
                      dynamicType: 'boolean',
                      optional: false,
                    },
                  ],
                },
              ],
            },
          },
        },
      ],
    }
    const { exportCode } = generate(ast, {
      typeName: 'ArrayResType',
    })

    expect(exportCode).toEqual(`export type ArrayResType = Array<{
  a: Array<number | string | boolean>
}>`)
  })

  it('check that the Array Type data is converted to ts code', () => {
    const ast = {
      type: 'Object Type',
      children: {
        a: {
          dynamicType: 'number',
          optional: true,
        },
        b: {
          dynamicType: 'string',
          optional: false,
        },
        c: {
          dynamicType: 'boolean',
          optional: true,
        },
      },
    }
    const { exportCode } = generate(ast, {
      typeName: 'ArrayResType',
    })

    expect(exportCode).toEqual(`export interface ArrayResType {
  a?: number
  b: string
  c?: boolean
}`)
  })
})
