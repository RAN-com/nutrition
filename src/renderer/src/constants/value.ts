//  change the port according to the server hosted
// default is 3000

const isDev = import.meta.env.NODE_ENV === 'development' || import.meta.env.DEV
export const SERVER_URL = isDev ? 'http://nutrition.localhost:3000' : 'https://nutrition.raninfo.in'

export const SERVER_DOMAIN = isDev ? 'nutrition.localhost:3000' : 'nutrition.raninfo.in'
