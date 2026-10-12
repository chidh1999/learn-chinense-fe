# Frontend — Chinese Learning

React + Vite + TypeScript. Trong Docker, Nginx phục vụ static build và proxy `/api` → service `backend` trên network `chinese-learning`.

## Docker

Chạy **backend trước** (để tạo network `chinese-learning`):

```bash
cd ../backend && cp .env.example .env && docker compose up --build -d
cd ../frontend && cp .env.example .env && docker compose up --build -d
```

UI: http://localhost:8080

```bash
docker compose logs -f
docker compose down
```

## Local (Vite)

```bash
cp .env.example .env
# đặt VITE_API_BASE_URL=http://localhost:5000/api
npm install
npm run dev
```
