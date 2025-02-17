import { is } from '@electron-toolkit/utils'

export const SERVER_URL = is.dev
  ? 'http://localhost:3000/api'
  : 'https://herbal-server.raninfo.in/api'

export const SERVER_DOMAIN = is.dev ? 'localhost:3000' : 'raninfo.in'
