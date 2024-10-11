import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { query, conversationId } = await req.json();
    
    console.log('Sending request to AppBuilder API with:', { query, conversationId });

    const response = await fetch('https://qianfan.baidubce.com/v2/app/conversation/runs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appbuilder-Authorization': `Bearer ${process.env.APPBUILDER_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: process.env.APPBUILDER_APP_ID,
        query,
        stream: true, // 开启流式响应
        conversation_id: conversationId,
      }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AppBuilder API error:', errorText);
      throw new Error(`Failed to fetch from AppBuilder API: ${response.statusText}. Error: ${errorText}`);
    }

    // 返回流式响应
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: unknown) {
    console.error('Error in chat API route:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'Internal Server Error', details: 'Unknown error' }, { status: 500 });
    }
  }
}