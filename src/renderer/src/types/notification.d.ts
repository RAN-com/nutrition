import { AppointmentData } from './staff'

export interface Notification {
  id: string // Unique identifier for the notification
  title: string // Title of the notification
  message: string // Detailed message for the notification
  timestamp: string // Time when the notification was created
  read: boolean // Flag to indicate if the notification has been read
  type: 'reminder' | 'update' | 'cancellation' // Type of notification
  metadata?: {
    appointment: AppointmentData
    staffId?: string // Optional staff ID for notifications related to staff
    userId?: string // Optional user ID for notifications related to users
  }
}

export interface CreateNotification {
  title: string
  message: string
  type: 'reminder' | 'update' | 'cancellation'
}
