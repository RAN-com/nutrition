export type PostsResponse = {
  title: string
  id: string
  description: string
  files: {
    type: 'image' | 'video'
    url: string
    isThumbnail: boolean
  }[]
  links?: {
    label: string
    url: string
  }[]
  type: 'work' | 'nutritional-information'
  createdAt: string
  updatedAt: string
}

export type CreatePostDetails = {
  title: string
  description: string
  files: {
    type: 'image' | 'video'
    url: string
    isThumbnail?: boolean
  }[]
  links?: {
    label: string
    url: string
  }[]
  createdAt?: string
  updatedAt?: string
}
