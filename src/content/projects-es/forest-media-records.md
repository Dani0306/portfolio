---
summary: 'Sitio web de una compañía musical de Medellín que impulsa artistas emergentes, con su agenda de conciertos, streams en Kick, showcases y lanzamientos.'
role: 'Desarrollador único: diseño, frontend, backend de contacto y despliegue.'
outcome: 'Construido en dos semanas. En producción en español e inglés, con formulario de contacto, consentimiento de cookies y páginas de privacidad y términos.'
---
## El cliente

Forest Media Récords es una compañía musical de Medellín que impulsa artistas emergentes, con el streaming integrado a su modelo gracias al apoyo de Kick. El sitio tenía que presentar al sello, mostrar a sus artistas y mantener a los fans al día con conciertos, streams y lanzamientos. La mayoría de visitantes llega desde redes sociales, en el celular.

## Cómo está construido

- **Next.js 16**, React 19, TypeScript y Tailwind CSS v4.
- **Todo el contenido vive en archivos de datos tipados** (eventos, artistas, streamers, precios del estudio, páginas legales) y todos los textos en un solo diccionario en español e inglés, así actualizarlo nunca toca un componente.
- **Español por defecto, con un botón para inglés** que cambia en el navegador. Es instantáneo, y el costo documentado es que los buscadores indexan la versión en español.
- **Un solo endpoint de contacto.** Los formularios de demos y de reservas envían a una única ruta que manda el correo al sello con Resend, con un campo trampa oculto y un límite de cinco envíos por visitante cada diez minutos. Antes, los formularios abrían la aplicación de correo del visitante, y los mensajes se perdían cuando un celular no tenía una configurada.
- **Un asistente con IA** responde las preguntas de los visitantes con `gpt-5-mini`. Sus instrucciones se arman a partir de los archivos de datos del sitio en cada solicitud, con la parte fija primero para que OpenAI la pueda guardar en caché.
- **Analítica solo con consentimiento.** Vercel Web Analytics carga solo cuando el visitante acepta todas las cookies, como promete la política de privacidad.

## Decisiones documentadas

El repositorio guarda un vault de Obsidian como memoria del proyecto, con una nota por cada decisión duradera: veintiuna hasta ahora. Una de ellas fija la regla del contenido: nunca inventar eventos, fechas ni biografías. Una sección sin datos reales muestra un estado vacío en lugar de contenido de relleno.

## Rendimiento

Una revisión dedicada redujo el video principal de 5.7 MB a 1.08 MB y lo pausa fuera de pantalla, cambió el desenfoque en vivo por una copia de la foto ya desenfocada y movió las animaciones a `transform`. Las notas registran una página de producción de unos 2.3 MB que se desplaza a 60 fps estables.
