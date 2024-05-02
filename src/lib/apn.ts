import * as apn from 'apn'
import { generateTime, handleError, deleteToken } from '../utils'
import { Mensaje } from '../interfaces'
import config from '../config'
const { apple } = config

export const sendAppleNotifications = async (
  token: string,
  payload: Mensaje
) => {
  try {
    const options = {
      token: {
        key: apple.file!,
        keyId: apple.key!,
        teamId: apple.team!
      },
      production: apple.isProduction
    }

    const apnProvider = new apn.Provider(options)

    const notification = new apn.Notification()
    notification.expiry = generateTime(7)
    notification.badge = 1
    notification.sound = 'ping.aiff'
    notification.alert = payload.mensaje
    notification.payload = payload
    notification.topic = apple.bundle!

    const {
      sent: notificationSent,
      failed: notificationFailed
    } = await apnProvider.send(notification, token)
    const [sent] = notificationSent
    const [failed] = notificationFailed
    if (failed) {
      const { response } = failed
      if (response != null) {
        const { reason } = response
        if (reason === 'BadDeviceToken') {
          await deleteToken(token, 'iOS')
        }
      }
      apnProvider.shutdown()
      return new Error('No evio')
    }

    apnProvider.shutdown()
    return {
      message: `Se pudo enviar la notificacion ${new Date()}`,
      payload: {
        sent
      }
    }
  } catch (error) {
    handleError(error)
  }
}
