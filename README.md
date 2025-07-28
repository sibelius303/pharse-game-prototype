# Guess The Words

Este proyecto es un juego interactivo en Next.js 15 (App Router) + TypeScript + Tailwind CSS.

## ¿Cómo jugar?
- En la página principal verás una frase con palabras ocultas.
- Ingresa las palabras faltantes en los campos numerados y presiona "Verificar".
- Si todas son correctas, verás “¡Correcto! 🎉”. Si hay errores, verás “Algunas respuestas son incorrectas ❌”.

## Scripts
- `npm run dev` — Inicia el servidor de desarrollo.
- `npm run build` — Compila la app para producción.
- `npm run start` — Inicia la app en modo producción.

## Tecnologías
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS

## Estructura principal
- `/app/page.tsx` — Página principal del juego.
- `/components/GuessTheWords.tsx` — Componente del juego.

## Personalización
Puedes modificar la frase y las palabras ocultas en el componente `GuessTheWords.tsx`.
