import * as Yup from 'yup'

export const fileOrStringSchema = Yup.mixed()
  .test('file-or-string', 'Must be a file or a valid string', (value) => {
    // Accept File instances (e.g., from input type="file")
    if (value instanceof File) return true

    // Accept non-empty strings
    if (typeof value === 'string' && value.trim() !== '') return true

    return true
  })
