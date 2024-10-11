import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const app_id = process.env.APPBUILDER_APP_ID;
    console.log('app_id', app_id);
    const response = await fetch('https://qianfan.baidubce.com/v2/app/conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appbuilder-Authorization': `Bearer ${process.env.APPBUILDER_API_KEY}`,
      },
      body: JSON.stringify({ "app_id": app_id }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AppBuilder API error:', errorText);
      throw new Error(`Failed to create conversation: ${response.statusText}. Error: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error in create conversation API route:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'Internal Server Error', details: 'Unknown error' }, { status: 500 });
    }
  }
}