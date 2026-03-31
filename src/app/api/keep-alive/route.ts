import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. 唤醒 Umami (轻触 User 表)
    await prisma.user.findFirst();

    // 2. 远端唤醒 Waline（携带有效来源并查询空记录以保障安全和速度）
    await fetch('https://waline.vtmatrix.com/api/comment?path=/&pageSize=1', {
      headers: {
        'User-Agent': 'Umami-Keep-Alive-Bot',
        'Origin': 'https://blog.vtmatrix.com' 
      },
    });

    return NextResponse.json({ 
      status: 'success', 
      message: 'Umami & Waline are awake!' 
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}