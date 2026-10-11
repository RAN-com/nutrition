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

export const embedAllStyles = (
  selector: string,
  title: string = 'Health Record',
  scale: boolean = true
) => {
  // Step 1: Render the React component as a static HTML string
  const element = document.querySelector(selector) as HTMLElement | null
  if (!element) return ''

  Object.assign(element.style, { ...element.style, transformOrigin: 'top left' })

  // Clone the element to avoid modifying the original DOM
  const clone = element.cloneNode(true) as HTMLElement

  // Extract all styles from the document
  const styles = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join('\n')
      } catch (e) {
        return '' // Ignore CORS-protected stylesheets
      }
    })
    .join('\n')
  // Calculate the scale factor to fit the content to A4 width and height
  const screenWidth = window.screen.width
  const elementWidth = element.offsetWidth

  const scaleFactor = 794 / Math.max(screenWidth, elementWidth)

  // Step 3: Embed everything into a complete HTML document with A4 print styles
  return `<html>
    <head>
      <meta charset="utf-8" />
      <title>${title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      <!-- Fonts & Icons -->
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />

      <!-- Extracted Styles -->
      <style>
        ${styles}

        /* A4 Size Optimization */
        @page {
          size: A4;
          margin: 10mm;
        }

        body {
          margin: 0;
          padding: 0;
          background-color: white;
          overflow: hidden;
          display: flex;
          ${scale ? 'justify-content: center; align-items: center;' : ''}

        }

        #root {
          transform-origin: top center;
          box-sizing: border-box;
          overflow: visible;
          width: 100%;
          display: inline-block;
        }

        /* Ensure tables, images, and text resize properly */
        table {
          width: 100%;
          border-collapse: collapse;
        }

        img {
          max-width: 100%;
          height: auto;
        }

        /* Avoid page breaks inside elements */
        h1, h2, h3, p, table, img {
          page-break-inside: avoid;
        }

        .set_print_transform_origin {
          transform-origin: top left;
          max-width: 100%;
        }

        /* Ensure proper page breaks */
        .page-break {
          page-break-before: always;
        }

      .set_print_transform_origin {
         transform: none;
        }

        .hide_on_print: {
        opacity: 0;
        }
      </style>
    </head>
    <body>
      <div id="root" style=${scale ? `transform: scale(${scaleFactor}); width: ${screenWidth}px` : ''}>
        ${clone.outerHTML}  <!-- Fully rendered React app -->
      </div>
    </body>
  </html>`
}
