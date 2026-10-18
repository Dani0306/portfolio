---
summary: 'Una aplicación de estudio con IA en producción, con inicio de sesión, almacenamiento de archivos y suscripciones.'
role: 'Desarrollador único: producto, diseño, frontend, backend, base de datos y despliegue.'
outcome: 'Construida en cinco semanas. En producción con inicio de sesión de Google, quizzes, resúmenes y diagramas con IA, y un plan Pro de pago con Paddle.'
---
## El producto

Classly es una aplicación de estudio con IA para estudiantes. Después de entrar con Google, el estudiante crea una clase, con un horario semanal opcional, y la llena de contenido. Cada tipo de contenido usa una llamada a la IA: las notas se corrigen, los resúmenes se escriben con la extensión elegida, los recordatorios y las tareas reciben fecha de entrega y prioridad, los quizzes traen hasta diez preguntas de opción múltiple y los diagramas se generan como imágenes. A cualquier contenido se le pueden adjuntar imágenes, PDF y archivos de Word, y un calendario muestra las clases junto a las entregas.

## Cómo está construida

- **Next.js 16 App Router**, React 19 y TypeScript estricto. Cada cambio en los datos es una server action con una sola tarea, como `actions/classes/createClass.ts` o `actions/ai/generateQuiz.ts`.
- **Supabase** para el inicio de sesión con Google, Postgres y el almacenamiento de archivos. La seguridad a nivel de fila está activa en todas las tablas, y cada política limita las filas a su dueño.
- **Un proxy** (el nuevo nombre del middleware en Next 16) devuelve a la página de inicio a quien entra a `/app` sin sesión y renueva la sesión.
- **La API Responses de OpenAI** escribe el texto con `gpt-5-mini`, y una herramienta de generación de imágenes dibuja los diagramas.

## Límites que impone la base de datos

El plan gratuito Starter y el plan Pro de 12 dólares al mes incluyen cupos de IA distintos. Esos límites viven en Postgres, no en la interfaz. Antes de cada llamada a la IA, una función de la base de datos registra la generación contra el cupo, así dos solicitudes simultáneas no pueden superarlo, y si la generación falla se devuelve el crédito.

```ts
// lib/ai/credits.ts, líneas 21 a 36
/**
 * Records one generation against the user's allowance before the AI call, so
 * concurrent requests can't overshoot it. Returns the usage id to hand to
 * refundAiCredit if the generation then fails.
 */
export const consumeAiCredit = async (kind: AiKind): Promise<string> => {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase.rpc("consume_ai_credit", {
    p_kind: kind,
  });

  if (error) throw new Error(messageFor(kind, error.message));

  return data as string;
};
```

## Pagos con Paddle

Al mejorar el plan se abre el checkout de Paddle. Un webhook verifica la firma de Paddle contra el cuerpo original de la solicitud antes de confiar en nada, guarda cada evento de suscripción en su propia tabla y un trigger de la base de datos mantiene sincronizado el plan del usuario. El webhook responde con error solo cuando reintentar puede ayudar, así Paddle nunca reintenta un evento que no se puede asociar a un usuario. Los usuarios tampoco pueden cambiar su propio plan: los permisos por columna solo les dejan editar su nombre y su foto.

## Construida con Claude Code

El CLAUDE.md del repositorio documenta el producto, cada tabla y política, y el flujo de datos, así cada sesión empieza conociendo la aplicación. Los cambios de esquema pasan por el servidor MCP de Supabase.
