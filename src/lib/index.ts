import { sendAppleNotifications } from './apn'
import { sendGoogleNotifications } from './fcm'
import { Mensaje } from '../interfaces'

export const sendNotification = async (
  type: 'Android' | 'iOS',
  token: string,
  notification: Mensaje
) => {
  try {
    if (type === 'Android') {
      return await sendGoogleNotifications(token, notification)
    } else {
      return await sendAppleNotifications(token, notification)
    }
  } catch (error) {
    return error
  }
}
