// src/app/api/anilist/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter } from '@/lib/rate-limiter';

export async function POST(req: NextRequest) {
  // 👇 INICIO DEL CAMBIO
  // Solo ejecuta el limitador si estamos en producción
  if (process.env.NODE_ENV === 'production') {
    const isAllowed = await rateLimiter(req);

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Too Many Requests' },
        { status: 429 }
      );
    }
  }
  // 👆 FIN DEL CAMBIO

  // El resto del código se ejecuta siempre
  const { query, variables } = await req.json();

  try {
    const apiResponse = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!apiResponse.ok) {
      throw new Error(`Failed to fetch from AniList API: ${apiResponse.statusText}`);
    }

    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}