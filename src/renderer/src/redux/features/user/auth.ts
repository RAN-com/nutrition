import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  createUser,
  createUserDocument,
  firebaseSignIn,
  getUserDocument,
  updateUserDocument
} from '@renderer/firebase'
import { Notification } from '@renderer/types/notification'
import { CenterUser } from '@renderer/types/user'
import { errorToast, successToast } from '@renderer/utils/toast'
import moment from 'moment'

type INITIAL_STATE = {
  user: CenterUser | null
  expTime: number | null
  startTime: number | null
  updating: boolean
  login_loading: boolean
  login_status: string | null
  logout_flag: boolean
  app_version: string | null
  notifications: Notification[]
}

const initialState: INITIAL_STATE = {
  user: null,
  login_loading: false,
  login_status: null,
  logout_flag: false,
  updating: false,
  expTime: null,
  startTime: null,
  app_version: null,
  notifications: []
}

const name = 'user'

export const asyncUpdateUser = createAsyncThunk(
  `${name}/asyncUpdateUser`,
  async ({ ...data }: Partial<CenterUser>) => {
    return await updateUserDocument({ ...data })
  }
)

export const asyncUserLogin = createAsyncThunk(
  `${name}/asyncUserLogin`,
  async ({ email, password }: { email: string; password: string }) => {
    return firebaseSignIn({ email, password })
      .then(async (d) => (d?.uid ? await getUserDocument(d?.uid) : null))
      .catch(null)
  }
)

export const asyncCreateUser = createAsyncThunk(
  `${name}/asyncCreateUser`,
  async ({
    email,
    password,
    ...others
  }: {
    email: string
    password: string
    name: string
    city: string
    locality: string
  }) => {
    return await createUser({ email, password })
      .then((data) => {
        if (data) {
          createUserDocument({ data, ...others })
            .then((d) => {
              if (d.error) {
                successToast(d?.message, 'Created Successfully')
              } else {
                errorToast(d?.message ?? 'Something went wrong')
              }
            })
            .catch(null)
        }
        return null
      })
      .catch(null)
  }
)

const userSlice = createSlice({
  name,
  initialState,
  reducers: {
    setLogoutFlag: (state, action) => {
      state.logout_flag = action.payload
    },
    setUser: (state, action) => {
      state.user = action.payload
    },
    resetUser: (state) => {
      Object.assign(state, initialState)
    },
    setAppVersion: (state, action) => {
      state.app_version = action.payload
    },
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload.sort((a, b) =>
        moment(b.timestamp).diff(moment(a.timestamp))
      )
    }
  },
  extraReducers: (builders) => {
    builders.addCase(asyncUserLogin.pending, (state) => {
      state.login_loading = true
    })

    builders.addCase(asyncUserLogin.rejected, (state) => {
      state.login_loading = false
    })

    builders.addCase(asyncUserLogin.fulfilled, (state, action) => {
      if (!action.payload?.error && action.payload?.data) {
        state.user = action.payload.data
        state.startTime = moment().toDate().getTime()
        state.expTime = moment().add(1, 'week').toDate().getTime()
      }
      state.login_loading = false
    })

    builders.addCase(asyncUpdateUser.pending, (state) => {
      state.updating = true
    })

    builders.addCase(asyncUpdateUser.rejected, (state) => {
      state.updating = false
    })

    builders.addCase(asyncUpdateUser.fulfilled, (state, action) => {
      if (action.payload?.data) {
        state.user = action.payload?.data?.data as unknown as CenterUser
      }
      state.updating = false
    })

    builders.addCase(asyncCreateUser.pending, (state) => {
      state.login_loading = true
    })

    builders.addCase(asyncCreateUser.rejected, (state) => {
      state.login_loading = false
    })

    builders.addCase(asyncCreateUser.fulfilled, (state) => {
      state.login_loading = false
    })
  }
})

export const { resetUser, setLogoutFlag, setUser, setAppVersion, setNotifications } =
  userSlice.actions

export default userSlice.reducer
