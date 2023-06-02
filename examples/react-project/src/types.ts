/**
 * Request URL: /posts/4/comments
 * 
 * Request Method: POST
 * 
 * @typeName PostCommentsResType
 */
export interface PostCommentsResType {
  postId: string
  id: number
}

/**
 * Request URL: /users
 * 
 * Request Method: GET
 * 
 * @typeName GetUsersResType
 */
export type GetUsersResType = Array<{
  id: number
  name: string
  username: string
  email: string
  address: {
    street: string
    suite: string
    city: string
    zipcode: string
    geo: {
      lat: string
      lng: string
    }
  }
  phone: string
  website: string
  company: {
    name: string
    catchPhrase: string
    bs: string
  }
}>

/**
 * Request URL: /photos/8
 * 
 * Request Method: GET
 * 
 * @typeName GetPhotosResType
 */
export interface GetPhotosResType {
  albumId: number
  id: number
  title: string
  url: string
  thumbnailUrl: string
}

/**
 * Request URL: /posts/4/comments
 * 
 * Request Method: GET
 * 
 * @typeName GetCommentsResType
 */
export type GetCommentsResType = Array<{
  postId: number
  id: number
  name: string
  email: string
  body: string
}>