import { createLogger, transports, format } from 'winston';
import * as path from 'path';
import * as fs from 'fs'

// Define la ruta de la carpeta de logs
const logsDir = path.resolve(__dirname, '../../logs');

// Crea la carpeta de logs si no existe
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Define el formato de fecha y hora
const customFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level}: ${message}`;
  })
);

// Configuración de los transportes de registro
export const logger = createLogger({
  format: customFormat,
  transports: [
    new transports.Console(),
    new transports.File({ 
      filename: path.join(logsDir, 'log.log'),
      format: customFormat
    })
  ]
});

// Funciones de registro
export const info = (message: string) => {
  logger.info(message);
};

export const warn = (message: string) => {
  logger.warn(message);
};

export const error = (message: string) => {
  logger.error(message);
};

export const debug = (message: string) => {
  logger.debug(message);
};
