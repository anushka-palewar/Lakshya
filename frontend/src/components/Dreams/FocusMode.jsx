import React, { useEffect, useState } from 'react';

export default function FocusMode({ dream, onClose }) {
  const DURATION = 60; // seconds
  const [secondsLeft, setSecondsLeft] = useState(DURATION);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setSecondsLeft(DURATION);
    setCompleted(false);
    const tick = () => setSecondsLeft((s) => s - 1);
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [dream?.id]);

  useEffect(() => {
    if (secondsLeft <= 0 && !completed) {
      setCompleted(true);
    }
  }, [secondsLeft, completed]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(circle at center, rgba(0,0,0,0.6), rgba(0,0,0,0.9))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        animation: 'focusFadeIn 400ms ease-out'
      }}
      onClick={onClose}
    >
      <style>{`@keyframes focusFadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}
      >
        <div style={{
          width: '100%',
          height: '70%',
          backgroundImage: `url(${dream?.imageUrl || ''})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 12,
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          marginBottom: 24,
          maxWidth: 1000
        }} />

        <h1 style={{ fontSize: 36, margin: 0, textAlign: 'center', maxWidth: 900 }}>{dream?.name}</h1>
        <p style={{ marginTop: 12, fontSize: 18, color: 'rgba(255,255,255,0.9)', textAlign: 'center', maxWidth: 900 }}>
          {dream?.description ? dream.description : 'Focus on your intention and breathe.'}
        </p>

        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 24 }}>
          {!completed ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 700 }}>{secondsLeft > 0 ? secondsLeft : 0}s</div>
              <div style={{ marginTop: 8, fontSize: 16, opacity: 0.9 }}>Stay present</div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>You are becoming the person who achieves this.</div>
            </div>
          )}
        </div>

        <div style={{ position: 'absolute', top: 20, right: 20 }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}
