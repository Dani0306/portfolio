---
summary: 'Convierte facturas en PDF o imagen en filas limpias de hoja de cálculo, y marca cada campo del que no está segura para que una persona lo revise en vez de adivinar.'
role: 'Desarrollador único: producto, diseño, frontend, backend, base de datos, evaluaciones y despliegue.'
outcome: 'Demo en vivo con ocho facturas de muestra. En un conjunto de prueba de 30 documentos lee bien el 99,8% de los campos por unos $0,0005 por documento, y un control de CI bloquea cualquier cambio que cueste más de 2 puntos de precisión.'
---
## El producto

PaperTrail convierte facturas en PDF o imagen en filas limpias de hoja de cálculo, como CSV o Excel. Un modelo lee el archivo directamente, sin paso de OCR, y devuelve proveedor, número de factura, fechas, moneda, líneas y totales. Cada campo llega con una confianza de 0 a 1 y el texto exacto del que se leyó el valor. Todo lo que queda por debajo del umbral se marca para que una persona lo revise en vez de adivinarse, y la corrección de una persona se guarda junto al valor del modelo, nunca encima.

La demo no pide iniciar sesión: hay ocho facturas sintéticas precargadas, públicas y de solo lectura, cada una extraída una vez con el flujo real. Al entrar con Google puedes subir las tuyas, y solo tú las ves. Todos los documentos del proyecto son sintéticos, sin facturas reales ni datos de clientes.

## Por dónde pasa un documento

- **Extracción:** el archivo llega a la API Responses de OpenAI como PDF o imagen. El SDK de IA de Vercel fuerza una llamada a función estricta, y un solo esquema de Zod le dice al modelo qué devolver y valida lo que regresa.
- **Una escalera de fallos:** una respuesta que no pasa la validación recibe un reintento de reparación con los errores. Si falla, una llamada nueva va al modelo de respaldo, más fuerte. Si también falla, una persona ingresa el documento a mano. Nunca se devuelven datos parciales.
- **Revisión:** una pantalla pone el documento junto a sus campos y resalta los de baja confianza, cada uno con su texto de origen.
- **Exportación:** CSV y Excel con las correcciones aplicadas y una columna Check que lista lo que sigue incierto.
- **Registro de costos:** cada llamada al modelo guarda sus tokens, costo, latencia y resultado.

## Medido, no adivinado

El modelo se eligió con números. En las primeras diez facturas, `gpt-6-luna` obtuvo 99,7% de precisión por campo contra 98,6% de `gpt-6.1-sol`, con un costo por documento unas 22 veces menor, así que luna es el modelo principal y sol el de respaldo.

Después el conjunto de prueba creció a 30 documentos, con la respuesta correcta copiada de cada documento original y nunca de la salida del modelo. Incluye una nota de crédito, facturas en alemán, francés, portugués y español, un total escrito a mano, un escaneo girado y un PDF cuya segunda página es solo una imagen. La corrida base obtuvo 99,8% en 90 extracciones, sin campos inventados.

- **Un error silencioso, y es del tipo importante.** En el escaneo girado de baja resolución, luna leyó `RO-60218` como `FO-60218` con confianza de 0,98 a 0,99. Ningún umbral menor a 1,0 lo marcaría, y el README lo dice: la confianza no atrapa un error del que el modelo está seguro.
- **La confianza vale lo que cuesta.** Pedirla suma cerca de 18% al costo de un documento. Sin ella, los errores silenciosos suben de 0,03 a 0,11 por documento y nada se puede marcar para revisión.
- **El umbral es una decisión, no un valor por defecto.** El corte de 0,85 se eligió con una regla fijada antes de probar umbrales de 0,70 a 0,95: primero los menos errores silenciosos, y luego los menos campos enviados a revisión.

## Cómo está construida

- **Next.js 16** con App Router, Turbopack y Cache Components, React 19 y TypeScript estricto. Tailwind CSS 4 lleva los tokens de diseño, y las fuentes son Inter, Playfair Display y Geist Mono con `next/font`.
- **Supabase** para Postgres en su propio esquema `papertrail`, un bucket privado de Storage con URLs de subida firmadas, e inicio de sesión con Google con PKCE del lado del servidor.
- **SheetJS** genera la exportación a Excel, y el escritor de CSV está hecho a mano.
- **Pruebas unitarias con Vitest** que nunca llaman al modelo, y ESLint. Un flujo Checks de GitHub Actions corre en cada cambio, y una puerta de evaluación corre la prueba de 30 documentos contra una línea base guardada y hace fallar el pull request si la precisión baja más de 2 puntos. Solo corre cuando cambian la extracción, la puntuación o las muestras, y cuesta unos $0,02 por corrida.

## Hecha con Claude Code

Claude Code (Claude Opus) escribió la aplicación en VS Code a partir de quince prompts de implementación escritos que viven en la carpeta `prompts/` del repositorio, y el CLAUDE.md del proyecto fija el alcance, el presupuesto y lo que queda fuera. El servidor MCP de Supabase, configurado en `.mcp.json`, le permitió al agente ejecutar migraciones, SQL y revisiones de seguridad sobre la base de datos real. Impeccable, un skill de diseño, revisó los archivos de la interfaz con un hook después de cada edición.
