import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. 唤醒 Umami (查自己的未授权接口，强制触发内置的鉴权 DB 校验)
    await fetch('https://umami.vtmatrix.com/api/auth/verify', {
      headers: {
        'User-Agent': 'Keep-Alive-Bot',
        'Origin': 'https://blog.vtmatrix.com'
      },
      // 关掉缓存，确保每次都真实验证
      cache: 'no-store' 
    });

    // 2. 远端唤醒 Waline（携带有效来源并查询空记录以保障安全和速度）
    await fetch('https://waline.vtmatrix.com/api/comment?path=/&pageSize=1', {
      headers: {
        'User-Agent': 'Keep-Alive-Bot',
        'Origin': 'https://blog.vtmatrix.com' 
      },
      cache: 'no-store'
    });

    return NextResponse.json({ 
      status: 'success', 
      message: 'Zero-Dependency Keep-Alive Successful!' 
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}