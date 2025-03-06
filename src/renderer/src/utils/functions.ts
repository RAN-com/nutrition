const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const capitalizeSentence = (str: string): string => {
  return str?.split('_').join(' ').split(' ').map(capitalize).join(' ')
}

export function generatePassword(): string {
  return Math.random().toString(36).slice(2, 10)
}

export const generateUniqueId = (): string => {
  const now = new Date()

  // Get components of the date and time
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0') // Month is zero-based
  const date = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0')

  // Add a random element for additional uniqueness
  const randomPart = Math.random().toString(36).substring(2, 8)

  // Combine all parts into a unique ID
  return `${year}${month}${date}${hours}${minutes}${seconds}${milliseconds}${randomPart}`
}

export function getBreadcrumbs() {
  const here = location.href.split('/').slice(3)
  // console.log(here)
  const parts: { text: string; link: string }[] = []
  // console.log(parts)

  for (let i = 0; i < here.length; i++) {
    const part = here[i]
    // console.log(part)
    const text = decodeURIComponent(part).split('.')[0]
    // console.log(text)
    const link = '/' + here.slice(0, i + 1).join('/')
    parts.push({ text: text, link: link })
    // console.log(parts)
  }
  return parts
}

export const getGreet = () => {
  const data: [number, string][] = [
      [22, 'Working late ?'],
      [18, 'Good evening!'],
      [12, 'Good afternoon!'],
      [5, 'Good morning!'],
      [0, 'Whoa, early bird']
    ],
    hr = new Date().getHours()
  return data.filter((e) => e[0] <= hr)[0]?.[1]
}

export function priceToLetters(price: number) {
  if (price >= 10000000) {
    // Crore (C) conversion for values 10,000,000 and above
    return (price / 10000000).toFixed(1) + 'C' // Converts to crore and appends 'C', keeping 1 decimal
  } else if (price >= 100000) {
    // Lakh (L) conversion for values 100,000 and above
    return (price / 100000).toFixed(1) + 'L' // Converts to lakh and appends 'L', keeping 1 decimal
  } else if (price >= 1000) {
    // Thousand (K) conversion for values 1,000 and above
    return (price / 1000).toFixed(1) + 'K' // Converts to thousand and appends 'K', keeping 1 decimal
  }
  return price.toString() // Return the number as is if less than 1000
}

export const extractNumFromString = (str: string) => {
  return parseInt(str.match(/\d/g)?.join('') ?? '0')
}
