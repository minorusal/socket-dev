import * as admin from 'firebase-admin'
import { handleError, deleteToken } from '../utils'
import { Mensaje } from '../interfaces'
import config from '../config'
const { google } = config

export const sendGoogleNotifications = async (
  token: string,
  payload: Mensaje
) => {
  try {
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(google.file!),
        databaseURL: google.database
      })
    }

    const notification = {
      notification: {
        title: payload.mensaje,
        body: JSON.stringify(payload)
      }
    }
    const notificationSent = await admin
      .messaging()
      .sendToDevice(token, notification)
    const { results } = notificationSent
    const [result] = results
    const { error } = result
    if (error != null) {
      const { code } = error
      if (code === 'messaging/invalid-registration-token') {
        await deleteToken(token, 'Android')
      }
    }

    return {
      message: `Se pudo enviar la notificación ${new Date()}`,
      payload: {
        notificationSent
      }
    }
  } catch (error) {
    handleError(error)
  }
}
