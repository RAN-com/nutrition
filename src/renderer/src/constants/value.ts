//  change the port according to the server hosted
// default is 3000

const isDev = import.meta.env.DEV
export const SERVER_URL = isDev ? 'http://localhost:3000/api' : 'https://herbal-life.raninfo.in/api'

export const SERVER_DOMAIN = isDev ? 'http://localhost:3000' : 'https://herbal-life.raninfo.in'
