<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted} from 'vue'
import axios from 'axios'
import {GetUsersResType, GetPostsCommentsResType, PostPostsCommentsResType, GetPhotosResType} from '../types'

export default defineComponent({
  setup() {
     onMounted(() => {
        axios.get('/api/users?time=' + new Date()).then((res: { data: GetUsersResType }) => {
          console.log(res.data)
        })
        axios.get('/api/posts/4/comments?time='+ +new Date()).then((res: {data: GetPostsCommentsResType}) => {
          console.log(res.data)
        })
        axios.post('/api/posts/4/comments?time='+ +new Date()).then((res: {data: PostPostsCommentsResType}) => {
          console.log(res.data)
        })

        axios.get('/api/photos/8?time='+ +new Date()).then((res: {data: GetPhotosResType}) => {
          console.log(res.data)
        })

        axios.post('/api/posts/anystringid/comments?time='+ +new Date()).then((res: {data: PostPostsCommentsResType}) => {
          console.log(res.data)
        })
      })
  },
})
</script>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
