import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getAllPosts, getPostById } from '@renderer/firebase/posts'
import { PostsResponse } from '@renderer/types/posts'

type INITIAL_STATE = {
  posts: {
    [key in 'work' | 'nutritional-information']: PostsResponse[]
  }
  currentPost?: PostsResponse | null
  currentPostLoading?: boolean
  loading: boolean
}

const initialState: INITIAL_STATE = {
  posts: {
    work: [],
    'nutritional-information': []
  },
  currentPost: null,
  currentPostLoading: false,
  loading: false
}

const name = 'posts'

export const asyncGetUserPosts = createAsyncThunk(
  `${name}/getUserPosts`,
  async (
    { uid, type }: { uid: string; type: 'work' | 'nutritional-information' },
    { rejectWithValue }
  ) => {
    try {
      const data = await getAllPosts(uid, type)
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch posts')
    }
  }
)

export const asyncGetCurrentPost = createAsyncThunk(
  `${name}/asyncGetCurrentPost`,
  async (
    {
      uid,
      type,
      postId
    }: { uid: string; type: 'work' | 'nutritional-information'; postId: string },
    { rejectWithValue }
  ) => {
    try {
      return await getPostById(uid, postId, type)
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch post')
    }
  }
)

const postsSlice = createSlice({
  name,
  initialState,
  reducers: {
    resetCurrentPost: (state) => {
      state.currentPost = null
      state.currentPostLoading = false
    }
  },
  extraReducers: (builders) => {
    builders
      .addCase(asyncGetUserPosts.pending, (state) => {
        state.loading = true
      })
      .addCase(asyncGetUserPosts.rejected, (state) => {
        state.loading = false
      })
      .addCase(asyncGetUserPosts.fulfilled, (state, action) => {
        const { type } = action.meta.arg
        state.posts[type] = action.payload || []
        state.loading = false
      })

    builders
      .addCase(asyncGetCurrentPost.pending, (state) => {
        state.currentPostLoading = true
      })
      .addCase(asyncGetCurrentPost.rejected, (state) => {
        state.currentPostLoading = false
      })
      .addCase(asyncGetCurrentPost.fulfilled, (state, action) => {
        state.currentPost = action.payload || null
        state.currentPostLoading = false
      })
      .addDefaultCase(() => {
        // This is a catch-all for any actions that don't match the above cases
        // It can be used to reset state or handle unexpected actions
      })
  }
})

export const { resetCurrentPost } = postsSlice.actions

export default postsSlice.reducer
