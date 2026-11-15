# Сакура — сайт японского ресторана

Лендинг на React + Vite: герой-блок, о ресторане, меню с категориями, форма бронирования, контакты.

## Запуск

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # сборка в dist/
```

## GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<ваш-логин>/sakura-restaurant.git
git push -u origin main
```

## Vercel

1. Зайдите на vercel.com и войдите через GitHub.
2. **Add New → Project** и выберите репозиторий.
3. Vercel сам определит Vite (Build: `npm run build`, Output: `dist`). Нажмите **Deploy**.

Каждый `git push` в `main` будет автоматически обновлять сайт.

## Что менять

- `src/data.js` — меню, цены, валюта, преимущества
- `src/App.jsx` — разметка и тексты разделов
- `src/styles.css` — цвета (переменные в `:root`) и шрифты
