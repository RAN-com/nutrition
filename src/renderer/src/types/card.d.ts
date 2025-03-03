import { OutputData } from '@editorjs/editorjs'

export type CardData = {
  createdOn: string
  updatedOn: string
  aid: string
  createdFor: string
  subscription?: {
    valid_till: string
  }
  personal_details: {
    whatsapp?: string
    email?: string
    map_embed?: string
    center_name?: string
    center_logo?: string
    displayName: {
      value: string
      designation: string
    }[]
    card_theme: {
      accent_color: string
      hero_bg_image: string
      background_color: string
    }
  }
  contact: {
    address: string
    socials: {
      title: string
      url: string
    }[]
    phone: string[]
  }
  about: OutputData
  services: {
    title: string
    subtitle: string
    photo_url: string | File
    description?: string
  }[]
  photo_gallery: {
    url: string
    description?: string
  }[]
  video_gallery: { title: string; subtitle: string; url: string; description?: string }[]
}

export type CardCreateData = {
  personal_details?: {
    whatsapp?: string
    email?: string
    map_embed?: string
    center_name?: string
    center_logo?: string
    displayName?: { value: string; designation: string }[]
    card_theme?: {
      accent_color: string
      hero_bg_image: string
      background_color: string
    }
  }
  contact?: {
    address?: string
    socials?: { title: string; url: string }[]
    phone?: string[]
  }
  about?: OutputData
  services?: {
    title: string
    subtitle: string
    photo_url: string | File
    description?: string
  }[]
  photo_gallery?: {
    url: string | File
    description?: string
  }[]
  video_gallery?: {
    url: string | File
    description?: string
  }[]
}

export type DomainData = {
  staff_id: string
  created_by: string
  created_on: string
  is_active: boolean
  subscription?: {
    subscribed_on: string
    valid_till: string
  }
}
