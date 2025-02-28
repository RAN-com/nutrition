//  change the port according to the server hosted
// default is 3000

const isDev = import.meta.env.DEV
export const SERVER_URL = isDev ? 'http://localhost:3000' : 'https://herbal-life.raninfo.in'

export const SERVER_DOMAIN = isDev ? 'localhost:3000' : 'herbal-life.raninfo.in'
