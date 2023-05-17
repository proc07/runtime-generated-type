import { describe, expect, it } from 'vitest'
import { baseParse, createTypeAst } from '../src/compile/parse'

describe('compile parse js data objects', () => {
  it('check plain array data to generate ast tree', () => {
    const data = {
      msg: 'success',
      data: [
        {
          a: [1, 2],
        },
        {
          a: ['3', '4'],
        },
        {
          a: [true, false],
        },
      ],
      code: 200,
    }
    const ast = createTypeAst(data)
    baseParse(data, ast)

    expect(ast).toEqual({
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
    })
  })

  it('check plain object data to generate ast tree', () => {
    const data = {
      msg: 'success',
      data: [
        {
          d: {
            test: '123',
          },
        },
        {
          d: {
            test: true,
          },
        },
      ],
      code: 200,
    }
    const ast = createTypeAst(data)
    baseParse(data, ast)

    expect(ast).toEqual({
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
                d: {
                  type: 'Object Type',
                  children: {
                    test: {
                      type: 'Union Type',
                      optional: false,
                      children: [
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
                  },
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
    })
  })

  it('check Object of different types', () => {
    const data = {
      msg: 'success',
      data: [
        {
          d: 1,
        },
        {
          d: [2, 3],
        },
        {
          d: { e: 4 },
        },
      ],
      code: 200,
    }
    const ast = createTypeAst(data)
    baseParse(data, ast)

    expect(ast).toEqual({
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
                d: {
                  type: 'Union Type',
                  optional: false,
                  children: [
                    {
                      dynamicType: 'number',
                      optional: false,
                    },
                    {
                      type: 'Array Type',
                      children: [
                        {
                          dynamicType: 'number',
                          optional: false,
                        },
                      ],
                    },
                    {
                      type: 'Object Type',
                      children: {
                        e: {
                          dynamicType: 'number',
                          optional: false,
                        },
                      },
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
    })
  })

  it('check Complex object and array case', () => {
    const data = {
      msg: 'success',
      data: [
        {
          d: ['1', true, { f: 'f' }],
        },
        {
          d: {
            c: '1',
          },
        },
        {
          d: [1, [2, '3'], { f: true, g: false }],
        },
        {
          d: {
            b: '1',
          },
        },
      ],
      code: 200,
    }
    const ast = createTypeAst(data)
    baseParse(data, ast)

    expect(ast).toEqual({
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
                d: {
                  type: 'Union Type',
                  children: [
                    {
                      type: 'Array Type',
                      children: [
                        {
                          type: 'Union Type',
                          optional: false,
                          children: [
                            {
                              dynamicType: 'string',
                              optional: false,
                            },
                            {
                              dynamicType: 'boolean',
                              optional: false,
                            },
                            {
                              dynamicType: 'number',
                              optional: false,
                            },
                          ],
                        },
                        {
                          type: 'Object Type',
                          children: {
                            f: {
                              type: 'Union Type',
                              optional: false,
                              children: [
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
                            g: {
                              dynamicType: 'boolean',
                              optional: true,
                            },
                          },
                        },
                        {
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
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'Object Type',
                      children: {
                        c: {
                          dynamicType: 'string',
                          optional: true,
                        },
                        b: {
                          dynamicType: 'string',
                          optional: true,
                        },
                      },
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
    })
  })

  it('case: A key value (primitive type) may be missing from the object', () => {
    const data = {
      msg: 'success',
      data: [
        {
          a: 1,
          b: 2,
          c: '3',
        },
        {
          a: true,
          b: '4',
          e: 5,
        },
        {
          a: '1',
          e: '1',
          f: true,
        },
        {
          a: '3',
          f: '3',
        },
      ],
      code: 200,
    }
    const ast = createTypeAst(data)
    baseParse(data, ast)

    expect(ast).toEqual({
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
                  type: 'Union Type',
                  optional: false,
                  children: [
                    {
                      dynamicType: 'number',
                      optional: false,
                    },
                    {
                      dynamicType: 'boolean',
                      optional: false,
                    },
                    {
                      dynamicType: 'string',
                      optional: false,
                    },
                  ],
                },
                b: {
                  type: 'Union Type',
                  optional: true,
                  children: [
                    {
                      dynamicType: 'number',
                      optional: true,
                    },
                    {
                      dynamicType: 'string',
                      optional: true,
                    },
                  ],
                },
                c: {
                  dynamicType: 'string',
                  optional: true,
                },
                e: {
                  type: 'Union Type',
                  optional: true,
                  children: [
                    {
                      dynamicType: 'number',
                      optional: true,
                    },
                    {
                      dynamicType: 'string',
                      optional: true,
                    },
                  ],
                },
                f: {
                  type: 'Union Type',
                  optional: true,
                  children: [
                    {
                      dynamicType: 'boolean',
                      optional: true,
                    },
                    {
                      dynamicType: 'string',
                      optional: true,
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
    })
  })

  it('case: A key value (object type) may be missing from the object', () => {
    const data = {
      msg: 'success',
      data: [
        {
          a: { b: 1 },
        },
        {
          b: {},
        },
        {
          b: [],
        },
      ],
      code: 200,
    }
    const ast = createTypeAst(data)
    baseParse(data, ast)

    expect(ast).toEqual({
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
                  type: 'Object Type',
                  children: {
                    b: {
                      dynamicType: 'number',
                      optional: false,
                    },
                  },
                  optional: true,
                },
                b: {
                  type: 'Union Type',
                  optional: true,
                  children: [
                    {
                      type: 'Object Type',
                      children: {},
                      optional: true,
                    },
                    {
                      type: 'Array Type',
                      children: [],
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
    })
  })
})
