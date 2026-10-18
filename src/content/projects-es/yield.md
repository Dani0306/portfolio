---
summary: 'Un tracker centrado en estadísticas que registra cada apuesta de una estrategia y mide qué tan rentable es.'
role: 'Desarrollador único: producto, diseño, frontend, backend, base de datos y despliegue.'
outcome: 'Construido en tres semanas. En producción; convierte cada apuesta registrada en ganancia, ROI, yield, tasa de acierto y rachas, con marcadores en vivo.'
---
## El producto

Yield es un tracker personal para una sola estrategia de apuestas: apuestas al empate elegidas a partir de la exportación de un modelo de predicción. Cada apuesta se registra con su monto, cuota, casa de apuestas y resultado, y la aplicación convierte ese registro en los números que dicen si la estrategia funciona. Está centrado en las estadísticas: casi todas las pantallas son tablas y cifras, registrar una apuesta es rápido y leer los números no cuesta esfuerzo.

## Qué mide

- **General:** ganancia neta, banca actual y crecimiento de la banca, ROI, yield, tasa de acierto de empates y cuota promedio.
- **Revisión de ventaja:** la tasa de empates que estima el modelo junto a la tasa real, para tener siempre a la vista la diferencia entre las dos.
- **Patrones:** las rachas ganadoras y perdedoras más largas, los marcadores más comunes y las casas de apuestas más usadas.
- **Historial:** una gráfica de ganancia acumulada y cada apuesta, con marcadores en vivo para las abiertas.

## Cómo está construido

- **Next.js 16** con React 19 y TypeScript, y **Supabase** para el inicio de sesión, Postgres y la seguridad a nivel de fila.
- **Cada cambio de esquema es una migración SQL** en el repositorio, dieciséis hasta ahora, así la base de datos se puede reconstruir desde cero.
- **El dinero y las cuotas son `numeric` de Postgres**, nunca decimales de punto flotante, y la ganancia se calcula a partir de cada apuesta en vez de guardarse.
- **La regla de apuesta vive en funciones puras** (`staking.ts`): cada apuesta usa la misma porción de la banca. Las apuestas del sistema de progresiones anterior conservan su historial.

## Marcadores en vivo con un plan gratuito

Los marcadores vienen de una API de fútbol gratuita limitada a 100 solicitudes al mes. La llave nunca sale del servidor, la aplicación solo pregunta cuando un partido ya pudo haber terminado y cada respuesta se guarda en caché: el id de un partido por un día, su estado por un minuto. Hacen falta dos llamadas, porque el estado del endpoint de búsqueda se atrasa horas: la búsqueda encuentra el partido y el endpoint de estado da el marcador final.

## Recordatorios antes del partido

Un job de `pg_cron` revisa cada minuto si hay un recordatorio pendiente. Solo entonces llama a una Edge Function de Supabase, que envía por Resend el correo de "empieza en 10 minutos" con el monto a apostar y las tres mejores cuotas encontradas.
