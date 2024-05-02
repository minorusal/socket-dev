# MC-Sockets

Funciones en tiempo real de Market Choice

### Colaboradores

[Hector Flores](https://github.com/hecto932)

[Rodrigo Patiño](https://github.com/4k1k0)

## Info

Este proyecto fue escrito en [Typescript](https://www.typescriptlang.org/docs).

## Info general sobre el proyecto

Este proyecto fue pensado originalmente para crear un chat entre clientes de MC a través de las cotizaciones, pero de un momento creció para añadir funcionalidades en tiempo real en otros aspectos de las aplicaciones.

Actualmente mc-sockets es utilizado para envío de mensajes de chat, crear y actualizar cotizaciones en tiempo real, enviar notificaciones push, etc.

La entrada inicial al programa es dentro de index.ts, donde creamos un servidor que viene de classes/server.ts y lo ejecutamos

Dentro del .gitignore existen dos archivos AuthKey... t fcm.json, estos son archivos para poder enviar notificaciones push a cada plataforma móvil. Se mantienen ignorados por git debido a que contienen secretkeys y demás información sensible sobre Firebase y APN

Dentro del módulo de config utilizamos el paquete dotenv para cargar las variables de entorno del archivo .env y generar un objeto con esta configuración

Dentro del directorio classes tenemos definiciones sobre el servidor, usuario y lista de usuario. El usuario contiene tanto el ID del websocket como el ID de usuario de MC, así como información sobre sus cotizaciones. Esto debido a que en REST API aún no contamos con JWT, pero es importante cambiar este comportamiento una vez que se pueda mejorar la REST API.

Dentro del directorio de interfaces tenemos diferentes interfaces, estas usualmente se refieren al tipo de información que llega de los clientes hacia una función del websocket.

Dentro de lib contamos con las implementaciones de los paquetes de apn y de fcm, esto para poder enviar notificaciones push a los clientes.

Dentro del directorio sockets contamos con las diferentes funciones del servidor de websockets, para poder tener el proyecto más organizado y modulado.

Dentro de utils contamos con algunas funciones de utilidades, como eliminar un TOKEN (asi se llama a un identificador de teléfono, apple o android) de la base de datos de MC, generar un mensaje para las notificaciones enviadas por push, etc

Este proyecto utiliza [Prettier](https://prettier.io/) con las configuraciones por defecto como guía de estilo.

Existen diferentes plugins para editores de texto en [su sitio oficial](https://prettier.io/docs/en/editors.html). Yo personalmente utilicé [Ale](https://github.com/dense-analysis/ale).

Es importante seguir una misma guía de estilo en el proyecto para tener un código fuente unificado y con las mismas reglas de escritura.

Este proyecto es desplegado en un Debian 10 en una EC2 de AWS, para actualizar el código fuente del servidor es necesario entrar por SSH, parar el servicio, actualizar el código fuente con git y volver a ejecutar el servicio.
