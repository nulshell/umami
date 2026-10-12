import { NextResponse } from 'next/server';

// 强制动态渲染，确保每次定时调用都会真正执行
export const dynamic = 'force-dynamic';
export const maxDuration = 10; // Vercel Hobby 免费计划函数限制 10s

export async function GET() {
  try {
    const origin = process.env.KEEPALIVE_ORIGIN;

    // 辅助请求函数：带 8 秒超时与环境变量容错，防止单个服务卡死拖垮整个函数
    const ping = async (name: string, url?: string, options: RequestInit = {}) => {
      if (!url) {
        return `${name} Skip: URL not configured`;
      }
      try {
        const res = await fetch(url, {
          ...options,
          cache: 'no-store',
          signal: AbortSignal.timeout(8000), // 8 秒未响应自动中断
        });
        return res.ok ? `${name}: OK (${res.status})` : `${name} Fail: ${res.status}`;
      } catch (err: any) {
        return `${name} Error: ${err.name === 'TimeoutError' ? 'Timeout (8s)' : err.message}`;
      }
    };

    const results = await Promise.all([
      // 1. Umami（直接查询数据库 REST API）
      ping('Umami', process.env.KEEPALIVE_UMAMI_URL, {
        headers: {
          apikey: process.env.KEEPALIVE_UMAMI_KEY || '',
          Authorization: `Bearer ${process.env.KEEPALIVE_UMAMI_KEY || ''}`,
          'User-Agent': 'Keep-Alive-Bot',
        },
      }),

      // 2. Waline（应用层 API，查询评论表）
      ping('Waline', process.env.KEEPALIVE_WALINE_URL, {
        headers: {
          'User-Agent': 'Keep-Alive-Bot',
          ...(origin ? { Origin: origin } : {}),
        },
      }),

      // 3. Talks（直接查询数据库 REST API）
      ping('Talks', process.env.KEEPALIVE_TALKS_URL, {
        headers: {
          apikey: process.env.KEEPALIVE_TALKS_KEY || '',
          Authorization: `Bearer ${process.env.KEEPALIVE_TALKS_KEY || ''}`,
          'User-Agent': 'Keep-Alive-Bot',
        },
      }),
    ]);

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      details: results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}