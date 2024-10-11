import React from 'react';
import Layout from '@/components/Layout/Layout';
import ChatWindow from '@/components/Chat/ChatWindow';

export default function Home() {
  return (
    <Layout>
      <div className="container mx-auto h-full px-4 py-8">
        <ChatWindow />
      </div>
    </Layout>
  );
}