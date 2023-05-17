/**
 * Request URL: /posts/4/comments
 * 
 * Request Method: POST
 * 
 * @typeName PostCommentsResType
 */
export interface aliasPostCommentsResType {
  postId: string
  id: number
}

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
export type GetCommentsResType = {
  postId: 
  id: 
}

/**
 * Request URL: /users
 * 
 * Request Method: GET
 * 
 * @typeName GetUsersResType
 */
export type GetUsersResType = {
  albumId: 
  id: 
  title: 
  url: 
  thumbnailUrl: 
}