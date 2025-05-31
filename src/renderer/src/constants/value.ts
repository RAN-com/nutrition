//  change the port according to the server hosted
// default is 3000

const isDev = import.meta.env.NODE_ENV === 'development' || import.meta.env.DEV
export const SERVER_URL = isDev ? 'http://vcard.localhost:3000' : 'https://vcard.raninfo.in'

export const SERVER_DOMAIN = isDev ? 'vcard.localhost:3000' : 'vcard.raninfo.in'
