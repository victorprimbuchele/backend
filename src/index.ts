import { createApp } from './interfaces/http/app';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

const app = createApp();
app.listen(PORT, () => {
  // Using console for simplicity here
  console.info(`[backend] listening on http://localhost:${PORT}`);
});


