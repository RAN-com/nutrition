import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getCardDetail } from '@renderer/firebase/card'
import { CardCreateData, CardData } from '@renderer/types/card'
import { errorToast } from '@renderer/utils/toast'

const BGImage1 = 'https://herballife-ran.s3.ap-south-1.amazonaws.com/themes/image-1.png'
const BGImage2 = 'https://herballife-ran.s3.ap-south-1.amazonaws.com/themes/image-2.png'
const BGImage3 = 'https://herballife-ran.s3.ap-south-1.amazonaws.com/themes/image-3.png'
const BGImage4 = 'https://herballife-ran.s3.ap-south-1.amazonaws.com/themes/image-4.png'

export const bgImages = [
  { bg: BGImage1, color: '#ae5240', backgroundColor: '#F4E8DB' },
  { bg: BGImage2, color: '#022436', backgroundColor: '#DDE2E5' },
  { bg: BGImage3, color: '#024747', backgroundColor: '#E6F2EF' },
  { bg: BGImage4, color: '#af6f25', backgroundColor: '#F5EDE3' }
]

type INITIAL_STATE = {
  data: CardData | null
  editor: {
    current_navigation: keyof CardCreateData | null
    data: CardCreateData
    data_type: 'NEW' | 'UPDATE'
    loading: boolean
    errors: {
      template_id: keyof CardCreateData
      inputs: { id: string; error: string }[]
    }[]
  }
}

const initialState: INITIAL_STATE = {
  data: null,
  editor: {
    data_type: 'NEW',
    current_navigation: null,
    loading: false,
    data: {},
    errors: []
  }
}

const name = 'card'

export const asyncInitCardUpdate = createAsyncThunk(
  `${name}/asyncInitCardUpdate`,
  async ({ sid }: { sid: string }) => await getCardDetail(sid)
)

const cardSlice = createSlice({
  name,
  initialState,
  reducers: {
    setPostedCardData(state, action: PayloadAction<CardData | null>) {
      state.data = action.payload
    },
    setCardDetails(
      state,
      action: PayloadAction<{
        id: keyof CardCreateData
        value: CardCreateData[keyof CardCreateData]
      }>
    ) {
      const { id, value } = action.payload
      state.editor.data = {
        ...state.editor.data,
        [id]: value
      }
    },
    setInitTheme: (state) => {
      state.editor.data = {
        ...state.editor?.data,
        personal_details: {
          ...state.editor?.data?.personal_details,
          card_theme: {
            accent_color: bgImages[0].color,
            background_color: bgImages[0].backgroundColor,
            hero_bg_image: bgImages[0].bg
          }
        }
      }
    },
    setCurrentNavigation(state, action: PayloadAction<keyof CardCreateData>) {
      state.editor.current_navigation = action.payload
    },
    validateCardDetails(
      state,
      action: PayloadAction<{
        id: keyof CardCreateData
      }>
    ) {
      function pushError(id: keyof CardCreateData, input: { id: string; error: string }) {
        const idx = state.editor.errors.findIndex((e) => e.template_id === id)
        if (idx < 0) {
          state.editor.errors.push({
            template_id: id,
            inputs: [input]
          })
        } else {
          const errors = state.editor.errors[idx].inputs
          state.editor.errors[idx] = {
            template_id: id,
            inputs: [...errors, input].filter(
              (value, index, array) => array.findIndex((i) => i.id === value.id) === index
            )
          }
        }
      }

      function removeError(id: keyof CardCreateData, inputIds: string[]) {
        const idx = state.editor.errors.findIndex((e) => e.template_id === id)
        if (idx >= 0) {
          state.editor.errors[idx].inputs = state.editor.errors[idx].inputs.filter(
            (input) => !inputIds.includes(input.id)
          )
          if (state.editor.errors[idx].inputs.length === 0) {
            state.editor.errors.splice(idx, 1)
          }
        }
      }

      const template = state.editor.data
      if (action.payload.id === 'about') {
        const data = template[action.payload.id]
        if (!data) {
          pushError('about', { id: 'about', error: 'About section is required' })
        } else {
          removeError('about', ['about'])
        }
        return
      } else if (action.payload.id === 'contact') {
        const data = template[action.payload.id]
        if (!data) {
          pushError('contact', {
            id: 'all',
            error: 'Enter the data'
          })
        } else {
          Object.keys(data).map((e) => {
            if (typeof data[e] === 'string' && data[e].length > 0) {
              removeError(action.payload.id, [e])
            } else if (Array.isArray(data[e]) && data[e].length > 0) {
              removeError(action.payload.id, [e])
            } else {
              pushError(action.payload.id, { id: e, error: `${e} is Required` })
            }
          })
        }
        return
      } else if (action.payload.id === 'photo_gallery' || action.payload.id === 'video_gallery') {
        const data = template[action.payload.id]
        if (!data) {
          pushError(action.payload.id, {
            id: 'all',
            error: 'Media need here'
          })
        } else {
          if (data.length > 0) {
            removeError(action.payload.id, [`media_${action.payload.id}`])
          } else {
            pushError(action.payload.id, {
              id: `media_${action.payload.id}`,
              error: 'Upload Media here'
            })
          }
        }
        return
      } else if (action.payload.id === 'personal_details') {
        const data = template[action.payload.id]
        if (!data) {
          pushError('personal_details', {
            id: 'all',
            error: 'Enter the data'
          })
        } else {
          Object.keys(data).map((e) => {
            if (typeof data[e] === 'string' && data[e].length > 0) {
              removeError(action.payload.id, [e])
            } else if (Array.isArray(data[e]) && data[e].length > 0) {
              removeError(action.payload.id, [e])
            } else {
              pushError(action.payload.id, { id: e, error: `${e} is Required` })
            }
          })
        }
        return
      } else if (action.payload.id === 'services') {
        const data = template[action.payload.id]
        if (!data) {
          pushError('services', {
            id: 'all',
            error: 'Enter the data'
          })
        } else {
          Object.keys(data).map((e) => {
            if (typeof data[e] === 'string' && data[e].length > 0) {
              removeError(action.payload.id, [e])
            } else {
              pushError(action.payload.id, { id: e, error: `${e} is Required` })
            }
          })
        }
      }
      // ...other cases...
    },
    resetEditor(state) {
      state.editor = initialState.editor
    }
  },
  extraReducers(builder) {
    builder.addCase(asyncInitCardUpdate.pending, (state) => {
      state.editor.loading = true
    })
    builder.addCase(asyncInitCardUpdate.rejected, (state) => {
      state.editor.loading = false
    })

    builder.addCase(asyncInitCardUpdate.fulfilled, (state, action) => {
      if (action.payload.status) {
        if (action.payload.data) {
          const { about, contact, personal_details, photo_gallery, services, video_gallery } =
            action.payload.data
          state.editor.data = {
            about,
            contact,
            personal_details,
            photo_gallery,
            services,
            video_gallery
          }
          state.editor.data_type = 'UPDATE'
        }
        errorToast(action.payload.message)
      } else {
        state.editor.data_type = 'NEW'
        state.editor.data = {
          about: undefined,
          contact: {
            address: undefined,
            phone: undefined,
            socials: []
          },
          personal_details: {
            card_theme: {
              accent_color: bgImages[0].bg,
              hero_bg_image: bgImages[0].color,
              background_color: bgImages[0].backgroundColor
            },
            center_name: undefined,
            displayName: []
          },
          photo_gallery: [],
          services: [],
          video_gallery: []
        }
      }

      state.editor.loading = false
    })
  }
})

export const {
  resetEditor,
  setPostedCardData,
  validateCardDetails,
  setCardDetails,
  setCurrentNavigation,
  setInitTheme
} = cardSlice.actions

export default cardSlice.reducer
