import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const origin = process.env.KEEPALIVE_ORIGIN!;

    await Promise.all([
      // 1. Umami (查自己的未授权接口，强制触发内置的鉴权 DB 校验)
      fetch(process.env.KEEPALIVE_UMAMI_URL!, {
        headers: { 'User-Agent': 'Keep-Alive-Bot', 'Origin': origin },
        cache: 'no-store'
      }),

      // 2. Waline （携带有效来源并查询空记录以保障安全和速度）
      fetch(process.env.KEEPALIVE_WALINE_URL!, {
        headers: { 'User-Agent': 'Keep-Alive-Bot', 'Origin': origin },
        cache: 'no-store'
      }),

      // 3. Talks （带 key 查询讲座表单）
      fetch(process.env.KEEPALIVE_TALKS_URL!, {
        headers: {
          'apikey': process.env.KEEPALIVE_TALKS_KEY!,
          'Authorization': `Bearer ${process.env.KEEPALIVE_TALKS_KEY!}`,
          'User-Agent': 'Keep-Alive-Bot'
        },
        cache: 'no-store'
      })
    ]);

    return NextResponse.json({
      status: 'success',
      message: 'Keep-Alive triggered!'
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}
