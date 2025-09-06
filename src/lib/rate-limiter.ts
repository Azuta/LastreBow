// src/lib/rate-limiter.ts

import { Redis } from '@upstash/redis';
import { NextRequest } from 'next/server';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function rateLimiter(req: NextRequest) {
  // Usamos la IP del usuario como identificador.
  const identifier = req.ip ?? '127.0.0.1';
  const limit = 5; // 5 peticiones
  const window = 60; // por 60 segundos

  const key = `rate_limit_${identifier}`;

  // 1. Incrementamos el valor de la clave. Redis devuelve el nuevo valor.
  const currentRequests = await redis.incr(key);

  // 2. Si el nuevo valor es 1, significa que la clave acaba de ser creada.
  //    Solo en este caso, establecemos la expiración.
  if (currentRequests === 1) {
    await redis.expire(key, window);
  }

  // 3. Finalmente, comprobamos si se ha excedido el límite.
  if (currentRequests > limit) {
    return false; // Límite excedido
  }

  return true; // Petición permitida
}