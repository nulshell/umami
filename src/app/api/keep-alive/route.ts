import { prisma } from 'lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. 唤醒 Umami
    await prisma.user.findFirst();

    // 2. 唤醒 Waline，查询网站首页（path=/）里的第一条评论（pageSize=1）的内容
    await fetch('https://waline.vtmatrix.com/api/comment?path=/&pageSize=1', {
      headers: {
        'User-Agent': 'Umami-Keep-Alive-Bot',
        // 伪装成是从博客发出的请求
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