class SimpleImage {
  constructor({ data, api }) {
    this.api = api
    this.data = {
      url: data.url || ''
    }
    this.imageRect = {
      width: data.width || 'inherit',
      height: data.height || 'inherit'
    }
    this.image = null
    this.wrapper = undefined
  }

  static get toolbox() {
    return {
      title: 'Image',
      icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>'
    }
  }

  render() {
    this.wrapper = document.createElement('div')
    this.wrapper.classList.add('simple-image')

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'

    input.addEventListener('change', (event) => {
      const file = event.target.files[0]
      if (file) {
        this._uploadImage(file).then((r) => {
          this.image = r.file.url
        })
      }
    })

    this.wrapper.appendChild(input)

    if (this.data && this.data.url) {
      this._createImage(this.data.url)
    }

    return this.wrapper
  }

  _createImage(url) {
    const image = document.createElement('img')
    image.src = url
    this.wrapper.innerHTML = ''
    this.wrapper.appendChild(image)

    const widthHeight = document.createElement('div')
    widthHeight.classList.add('width-height')
    widthHeight.innerHTML = `
    <style>
    .width-height {
      width: fit-content;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: start;
    }

    .width-height .width,
    .width-height .height {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      margin: 5px 0;
     }

    .width-height .width input,
    .width-height .height input {
      width: 50%;
      padding: 5px;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
  </style>
            <div class="width">
                <label>Width</label>
                <input type="text" />
            </div>
            <div class="height">
                <label>Height</label>
                <input type="text" />
            </div>
        `
    const width = widthHeight.querySelector('.width-height .width input')
    const height = widthHeight.querySelector('.width-height .height input')

    width.addEventListener('change', (event) => {
      // console.log(event.target.value, "width");
      this.imageRect.width = event.target.value
      document.execCommand('insertHTML', false, image.outerHTML)
    })

    height.addEventListener('change', (event) => {
      // console.log(event.target.value, "height");
      this.imageRect.height = event.target.value
      this.save(image)
      document.execCommand('insertHTML', false, image.outerHTML)
    })

    width.addEventListener('blur', (event) => {
      // console.log(event.target.value, "width");
      image.style.width = this.imageRect.width
      image.style.height = this.imageRect.height
      this.save(image)
    })

    height.addEventListener('blur', (event) => {
      // console.log(event.target.value, "height");
      image.style.width = this.imageRect.width
      image.style.height = this.imageRect.height
      this.save(image)
    })

    this.wrapper.appendChild(widthHeight)
  }

  async _uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)

    try {
      // const response = await fetch(
      //   'https://app-server-ogdg.onrender.com/v1/learn/editorjs/upload',
      //   {
      //     method: 'POST',
      //     body: formData
      //   }
      // )
      // const data = await response.json()
      // this.data.url = data.file.url // Update the URL
      this._createImage(URL.createObjectURL(file)) // Use the uploaded image URL
      return {
        success: 1,
        file: { url: data.file.url }
      }
    } catch (err) {
      return console.log(err)
    }
  }

  save(blockContent) {
    // console.log("SAVING", blockContent);
    return {
      url: this.image, // Preserve the existing URL
      caption: this.data.caption, // Preserve the existing caption
      ...this.imageRect
    }
  }

  validate(savedData) {
    if (typeof savedData.url === 'undefined')
      return {
        url: '',
        width: 'inherit',
        height: 'inherit',
        caption: ''
      }
    // console.log(savedData);
    return savedData.url.trim()
  }
}

export default SimpleImage
