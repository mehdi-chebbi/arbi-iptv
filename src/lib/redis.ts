import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: 'https://concrete-eel-28852.upstash.io',
  token: 'AXC0AAIncDEyZTNjOWM0YWZkNDI0YjAxYWNiYjBkMGQ3NGZhMmZhY3AxMjg4NTI',
});

export default redis;