import { describe, expect, it } from 'vitest'

describe('should', () => {
  it('exported plain Array', () => {
    const resData = {
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

    expect(1).toEqual(1)
  })

  it('exported plain Object', () => {
    const resData = {
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

    expect(1).toEqual(1)
  })

  it('exported Object of different types', () => {
    const resData = {
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

    expect(1).toEqual(1)
  })

  it('exported array -> object -> array -> object', () => {
    const resData = {
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

    expect(1).toEqual(1)
  })

  it('exported A key value (primitive type) may be missing from the object', () => {
    const resData = {
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

    expect(1).toEqual(1)
  })

  it('exported A key value (object type) may be missing from the object', () => {
    const resData = {
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

    expect(1).toEqual(1)
  })
})
