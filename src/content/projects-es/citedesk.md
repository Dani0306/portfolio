---
summary: 'Un asistente de documentación que responde solo con un conjunto dado de documentos, cita el pasaje exacto detrás de cada frase y dice "no sé" cuando la documentación no cubre la pregunta.'
role: 'Desarrollador único: producto, diseño, recuperación, evaluaciones, backend, base de datos y despliegue.'
outcome: 'En el laboratorio, con una demo en vivo sobre las guías de Database y AI de Supabase: 835 fragmentos, las 997 anclas de cita verificadas contra la documentación en vivo, y entre $0,0003 y $0,0017 por pregunta. Las métricas de recuperación esperan un conjunto de 40 preguntas etiquetadas.'
---
## El producto

CiteDesk es un asistente para preguntarle a la documentación que tiene que mostrar de dónde saca cada cosa. Haces una pregunta en lenguaje natural y responde solo con un conjunto dado de documentos, hoy las guías de Database y AI de Supabase. Cada frase de la respuesta termina en un marcador de cita, y cada marcador abre el pasaje exacto que la respalda, con un enlace a esa sección de la documentación en vivo. Cuando la documentación no cubre la pregunta, dice "no sé" y muestra la sección más cercana en vez de adivinar.

Las fuentes aparecen antes que la respuesta, así que puedes empezar a verificar mientras todavía se escribe. En una prueba con Chrome sin interfaz, la primera tarjeta de fuente apareció 1,6 segundos antes de la primera palabra de la respuesta.

El producto es pequeño a propósito. La otra mitad del proyecto es lo importante: un conjunto de evaluaciones que mide si encuentra los pasajes correctos.

## Qué le pasa a una pregunta

- **Recuperación híbrida:** una búsqueda por similitud con pgvector (HNSW, coseno) y una búsqueda de texto completo de Postgres corren en paralelo, y la fusión por rango recíproco las combina. Un reordenamiento opcional con un LLM reduce los 50 mejores a 8. Cada etapa se puede activar o desactivar y medir por separado.
- **El rechazo se decide en código:** si la similitud vectorial más alta queda por debajo del umbral, la respuesta es "no sé" y el modelo de respuesta nunca se llama. Una pregunta rechazada cuesta un embedding.
- **Las citas se verifican en código:** `gpt-6-luna` escribe la respuesta en streaming con marcadores `[n]`, y el código comprueba que cada marcador apunte a un pasaje que de verdad se recuperó para esa pregunta. "Citas inventadas: 0" es un conteo, no una opinión.
- **Cada llamada queda registrada:** tokens, costo y latencia van a una tabla `model_calls`, con precios de una tabla fechada, y las trazas van a Langfuse. Los límites diarios de respuestas y reordenamientos se cuentan desde ese registro.
- **Un playground de recuperación** en `/playground` muestra el camino completo de una pregunta: la posición de cada candidato en la búsqueda vectorial, la de texto completo, la fusión y el reordenamiento, si llegó al modelo y si la respuesta lo citó.

## Decisiones que importaron

- **Los fragmentos siguen los títulos de la propia documentación**, no ventanas fijas, porque una cita tiene que apuntar a un título que contenga el pasaje. Las subsecciones se unen hasta 800 tokens: 835 fragmentos, con una mediana de 166 tokens.
- **Marcadores en vez de la función de citas de un proveedor.** Una búsqueda de archivos alojada recuperaría con su propio índice y escondería justo lo que el proyecto mide.
- **Etiquetas por sección, no por id de fila**, para que cambiar el tamaño de los fragmentos nunca invalide una etiqueta, y una sección larga partida en dos no pueda puntuar dos veces.
- **La caché de prompts como una apuesta medida.** Solo las preguntas repetidas exactas usan la caché, y cada prompt nuevo cuesta 25% más por escribirla. Con cuatro preguntas por pasada, la caché compensa cuando más de cerca del 31% de las preguntas son repetidas. Cuatro preguntas miden el mecanismo, no son un benchmark, y el caso de estudio lo dice.

## Qué salió mal, y qué me enseñó

- **Una consulta con `LIMIT 50` devolvía 40 filas sin avisar.** El índice HNSW de pgvector limita los resultados a `ef_search`, 40 por defecto, y nada da error. Ahora la función de la base de datos lo sube al número pedido en cada llamada.
- **La búsqueda por palabras no encontraba nada.** La receta documentada exige que coincidan todas las palabras de la pregunta, y eso encontraba 0 de 835 fragmentos para preguntas escritas como frases. Aceptar cualquier palabra y dejar que el orden por relevancia haga el trabajo lo resolvió.
- **Una página casi vacía produjo una respuesta segura con la fuente equivocada.** La cita era válida, porque apuntaba a un pasaje recuperado, pero la afirmación no estaba respaldada. Por eso verificar las citas y juzgar si la respuesta está fundamentada son dos números distintos.
- **La documentación real no se procesa como dice el framework.** Las anclas de cita coincidieron en un 96,8% al primer intento, y en 997 de 997 solo después de estudiar cómo las genera de verdad el sitio en vivo.

## Las evaluaciones

Recall@k, MRR y nDCG para la recuperación, un barrido de umbrales para el corte de rechazo, un juez de fundamentación (`gpt-6.1-sol`) calibrado contra etiquetas hechas a mano con el kappa de Cohen, una tabla de diagnóstico que atribuye cada fallo a la recuperación o a la generación, un control de regresión y una prueba de humo. Las evaluaciones llaman a las mismas funciones que la aplicación, así que miden lo que hace el producto.

Las cifras principales necesitan 40 preguntas etiquetadas a mano y 10 que la documentación no puede responder, y las etiquetas se escriben a mano, no a partir de la salida del propio sistema, porque eso lo favorecería. Hasta que exista ese conjunto, el README muestra los resultados de recuperación y fundamentación como **Pending** en vez de reportar un número que ningún archivo de corrida contiene. Lo que ya está medido: $0,036 entre las 161 llamadas al modelo registradas, de los cuales $0,0043 fueron para crear los embeddings de toda la documentación.

## Cómo está construido

- **Next.js 16** con App Router, Cache Components y Turbopack, React 19 y TypeScript estricto sobre Node.js 24. Tailwind CSS 4, con Geist Mono para el texto de las fuentes.
- **El SDK de IA de Vercel 7** para el streaming, la salida estructurada y los embeddings, con `text-embedding-3-small` (1.536 dimensiones). Zod 4 valida cada frontera: solicitudes, salida del modelo, archivos de evaluación y archivos de corrida.
- **Supabase Postgres** en su propio proyecto y un esquema `citedesk`, con seguridad a nivel de fila y acceso solo con la clave de servicio. Las migraciones y las funciones de la base de datos son SQL y PL/pgSQL.
- **La fragmentación** cuenta tokens con `gpt-tokenizer` y arma las anclas con `github-slugger`, para que coincidan con el sitio en vivo. El corpus es la documentación de Supabase (Apache 2.0), fijada en el commit `aa9d04e`.
- **Observabilidad** con Langfuse Cloud y OpenTelemetry.
- **Vitest** (253 pruebas, sin red), ESLint y `tsc`. GitHub Actions corre las revisiones gratuitas en cada push, además del control de evaluación.

## Hecho con Claude Code

Claude Code lo construyó en un ciclo de prompt, aprobación e implementación, con una rama por tarea y el prompt de cada fase guardado en la carpeta `prompts/` del repositorio. El servidor MCP de Supabase aplicó las migraciones y el de Langfuse revisó las trazas. Firecrawl investigó productos parecidos y leyó la documentación. Chrome sin interfaz hizo las pruebas de navegador, y los diagramas Mermaid del README se generaron para verificarlos. La imagen principal de la página de inicio se hizo con Higgsfield.
