/**
 * Cognitive Zoom - DSH Native Web Client Plugin
 * Injects Cognitive Zoom Slider directly into DSH top navigation bar (header actions),
 * and enables Ctrl+Wheel density zooming directly inside DSH chat bubbles!
 */

import { createElement as h, useState, useEffect, useRef } from 'react';

export const inject = ['slots'];

const LEVEL_NAMES = [
  '🛰️ L0 衛星',
  '🏙️ L1 城市',
  '🛣️ L2 街道',
  '🏗️ L3 建築',
  '🔬 L4 顯微鏡',
];

function applyZoomToDshDom(level) {
  // 1. Set global attribute on body/chat
  document.documentElement.setAttribute('data-cognitive-zoom', String(level));

  // 2. Control all <details> elements marked with zoom levels in chat messages
  const chatMessages = document.querySelectorAll('.dsw-message, [class*="message"], article');
  chatMessages.forEach((msg) => {
    // Find L3 details
    const l3Details = msg.querySelectorAll('details[data-level="3"], details.zoom-l3');
    l3Details.forEach((el) => {
      el.open = level >= 3;
    });

    // Find L4 details
    const l4Details = msg.querySelectorAll('details[data-level="4"], details.zoom-l4');
    l4Details.forEach((el) => {
      el.open = level >= 4;
    });

    // If level < 2, optionally dim or collapse L2 sections
    const l2Sections = msg.querySelectorAll('.zoom-l2');
    l2Sections.forEach((el) => {
      el.style.display = level < 2 ? 'none' : 'block';
    });
  });
}

function CognitiveSliderWidget() {
  const [zoomLevel, setZoomLevel] = useState(2);
  const zoomRef = useRef(zoomLevel);
  zoomRef.current = zoomLevel;

  useEffect(() => {
    applyZoomToDshDom(zoomLevel);
  }, [zoomLevel]);

  // Intercept Ctrl + Wheel inside DSH
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 1 : -1;
        const newZ = Math.max(0, Math.min(4, zoomRef.current + delta));
        if (newZ !== zoomRef.current) {
          setZoomLevel(newZ);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  return h(
    'div',
    {
      className: 'czoom-dsh-widget',
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        background: 'var(--dsw-alias-state-business-secondary, rgba(30, 41, 59, 0.8))',
        border: '1px solid var(--dsw-alias-border-primary, rgba(56, 189, 248, 0.3))',
        borderRadius: '16px',
        fontSize: '12px',
        color: 'var(--dsw-alias-text-primary, #f8fafc)',
        marginRight: '8px',
        userSelect: 'none',
      },
      title: '認知縮放 (Cognitive Zoom)：拖動或在對話中按住 Ctrl+滾輪 無段切換閱讀深度',
    },
    h(
      'span',
      {
        style: {
          fontWeight: 'bold',
          color: '#38bdf8',
          marginRight: '4px',
        },
      },
      LEVEL_NAMES[zoomLevel] || `L${zoomLevel}`
    ),
    h('input', {
      type: 'range',
      min: 0,
      max: 4,
      step: 1,
      value: zoomLevel,
      onChange: (e) => setZoomLevel(parseInt(e.target.value, 10)),
      style: {
        width: '70px',
        height: '4px',
        cursor: 'pointer',
        accentColor: '#38bdf8',
      },
    })
  );
}

export function apply(ctx) {
  const slots = ctx.get('slots');
  if (!slots || typeof slots.inject !== 'function') return;

  // Inject into DSH top header actions bar (next to model name & session title)
  slots.inject('conversation.session.header.actions', () =>
    slots.register(
      {
        name: 'conversation.session.header.actions',
        id: 'cognitive-zoom-header-widget',
        order: -5,
        inject: () => ({}),
      },
      CognitiveSliderWidget
    )
  );
}
