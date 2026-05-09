'use client';

import { useState } from 'react';

// This is the embeddable widget script
export function EmbedWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            padding: '12px 24px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontFamily: 'system-ui',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🤖 Audit AI Spend
        </button>
      ) : (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
          width: '380px',
          maxWidth: 'calc(100vw - 40px)',
          overflow: 'hidden'
        }}>
          <div style={{
            background: '#2563eb',
            color: 'white',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontWeight: 'bold' }}>AI Spend Audit</span>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>×</button>
          </div>
          <div style={{ padding: '16px' }}>
            <iframe 
              src={`${process.env.NEXT_PUBLIC_APP_URL}/embed/simple-form`}
              style={{ width: '100%', height: '400px', border: 'none' }}
              title="AI Spend Audit Widget"
            />
          </div>
        </div>
      )}
    </div>
  );
}