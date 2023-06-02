import { describe, expect, it } from 'vitest'
import { extractPathName } from '../src/index'

const uuid = '2368601d-721d-4152-9764-47b4c9d90f61'
const numberid = 12345678
const anystringid = 'anystring'
const options = {
  baseUrl: '/api/*',
  matching: ['team/*', '/team/department/frontGroup/*', '/team/department/*/details'],
}

describe('request url to generate type name matching rules', () => {
  it('checks the ts file replacement type', () => {})

  it('url: one-layer routing', () => {
    expect(extractPathName('/api/v1/user', options)).toStrictEqual('User')
  })

  it('url: two-layer routing', () => {
    expect(extractPathName('/api/v1/user/info', options)).toStrictEqual('UserInfo')

    // id: number
    expect(extractPathName(`/api/v1/team/${numberid}`, options)).toStrictEqual('Team')
    // id: uuid
    expect(extractPathName(`/api/v1/team/${uuid}`, options)).toStrictEqual('Team')
    // id: any length string
    expect(extractPathName(`/api/v1/team/${anystringid}`, options)).toStrictEqual('Team')
  })

  it('url: multi-layer routing', () => {
    expect(extractPathName(`/api/v1/team/department/frontGroup/${numberid}`, options)).toStrictEqual('TeamDepartmentFrontGroup')
    expect(extractPathName(`/api/v1/team/department/${uuid}/details`, options)).toStrictEqual('TeamDepartmentDetails')
    expect(extractPathName(`/api/v1/team/department/${anystringid}/details`, options)).toStrictEqual('TeamDepartmentDetails')
  })
})
