import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const origin = process.env.KEEPALIVE_ORIGIN!;

    const results = await Promise.all([
      // 1. Umami (查自己的未授权接口，强制触发内置的鉴权 DB 校验)
      fetch(process.env.KEEPALIVE_UMAMI_URL!, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 
          'Origin': origin 
        },
        cache: 'no-store'
      })
      .then(res => res.ok ? 'Umami: OK' : `Umami Fail: ${res.status}`)
      .catch(err => `Umami Error: ${err.message}`),

      // 2. Waline （携带有效来源并查询空记录以保障安全和速度）
      fetch(process.env.KEEPALIVE_WALINE_URL!, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 
          'Origin': origin 
        },
        cache: 'no-store'
      })
      .then(res => res.ok ? 'Waline: OK' : `Waline Fail: ${res.status}`)
      .catch(err => `Waline Error: ${err.message}`),

      // 3. Talks （带 key 查询讲座表单）
      fetch(process.env.KEEPALIVE_TALKS_URL!, {
        headers: {
          'apikey': process.env.KEEPALIVE_TALKS_KEY || '',
          'Authorization': `Bearer ${process.env.KEEPALIVE_TALKS_KEY || ''}`,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        cache: 'no-store'
      })
      .then(res => res.ok ? 'Talks: OK' : `Talks Fail: ${res.status}`)
      .catch(err => `Talks Error: ${err.message}`)
    ]);

    return NextResponse.json({
      status: 'success',
      message: 'Keep-Alive triggered!',
      details: results, // 返回 3 个请求的真实状态码
      envCheck: {
        hasTalksUrl: !!process.env.KEEPALIVE_TALKS_URL,
        hasTalksKey: !!process.env.KEEPALIVE_TALKS_KEY
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}
