import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const origin = process.env.KEEPALIVE_ORIGIN!;

    const results = await Promise.all([
      // 1. Umami（直接查询 database REST API）
      fetch(process.env.KEEPALIVE_UMAMI_URL!, {
        headers: {
          'apikey': process.env.KEEPALIVE_UMAMI_KEY || '',
          'Authorization': `Bearer ${process.env.KEEPALIVE_UMAMI_KEY || ''}`,
          'User-Agent': 'Keep-Alive-Bot'
        },
        cache: 'no-store'
      })
      .then(res => res.ok ? 'Umami: OK' : `Umami Fail: ${res.status}`)
      .catch(err => `Umami Error: ${err.message}`),

      // 2. Waline（应用层 API，查询评论表）
      fetch(process.env.KEEPALIVE_WALINE_URL!, {
        headers: { 'User-Agent': 'Keep-Alive-Bot', 'Origin': origin },
        cache: 'no-store'
      })
      .then(res => res.ok ? 'Waline: OK' : `Waline Fail: ${res.status}`)
      .catch(err => `Waline Error: ${err.message}`),

      // 3. Talks（直接查询 database REST API）
      fetch(process.env.KEEPALIVE_TALKS_URL!, {
        headers: {
          'apikey': process.env.KEEPALIVE_TALKS_KEY || '',
          'Authorization': `Bearer ${process.env.KEEPALIVE_TALKS_KEY || ''}`,
          'User-Agent': 'Keep-Alive-Bot'
        },
        cache: 'no-store'
      })
      .then(res => res.ok ? 'Talks: OK' : `Talks Fail: ${res.status}`)
      .catch(err => `Talks Error: ${err.message}`)
    ]);

    return NextResponse.json({
      status: 'success',
      message: 'Keep-Alive triggered!',
      details: results
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}
