/*!
 * BBChat — n8n Chat Widget Library
 * https://github.com/YOUR_USERNAME/bb-chat
 *
 * Usage:
 *   <script src="chat.js"></script>
 *   <script>
 *     BBChat.init({ webhookUrl: 'https://your-n8n.com/webhook/xxx/chat' })
 *   </script>
 */
(function (global) {
  'use strict';

  // ─── DEFAULT CONFIG ────────────────────────────────────────────────────────
  const DEFAULTS = {
    webhookUrl:     '',                          // REQUIRED
    botName:        "Chat Assistant",
    welcomeMessage: "Hi! 👋 How can I help you today?",
    placeholder:    "Type a message...",
    buttonText:     "Chat",
    position:       "bottom-right",              // bottom-right | bottom-left | top-right | top-left
    primaryColor:   "#5BA4B5",
    buttonColor:    "#007D99",
    accentColor:    "#FAD02C",
    maxImages:      3,
  };

  // ─── CSS ───────────────────────────────────────────────────────────────────
  const CSS = `
    #bbchat-btn {
      position: fixed;
      width: auto;
      height: 40px;
      padding: 0 16px 0 14px;
      border-radius: 20px;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: transform 0.3s, box-shadow 0.3s;
      z-index: 9998;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    #bbchat-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.2); }
    #bbchat-btn svg   { width: 24px; height: 24px; flex-shrink: 0; }
    #bbchat-btn .bbchat-btn-text {
      font-size: 16px; font-weight: 700;
      letter-spacing: 0.5px; text-transform: capitalize;
    }

    #bbchat-container {
      position: fixed;
      width: 480px; height: 530px;
      border-radius: 0;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      display: none; flex-direction: column;
      transition: all 0.3s;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #D5E8EF;
    }
    #bbchat-container.bbchat-open { display: flex; }

    .bbchat-header {
      padding: 16px 20px;
      color: white;
      display: flex; justify-content: space-between; align-items: center;
      flex-shrink: 0;
    }
    .bbchat-header h3 { font-size: 16px; font-weight: 700; margin: 0; }
    .bbchat-header-btns { display: flex; gap: 8px; }
    .bbchat-header-btns button {
      border: none; width: 32px; height: 32px;
      border-radius: 50%; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s;
    }
    .bbchat-header-btns button:hover { transform: scale(1.05); }
    .bbchat-header-btns svg { width: 18px; height: 18px; }

    .bbchat-messages {
      flex: 1; overflow-y: auto;
      padding: 20px; display: flex;
      flex-direction: column; gap: 12px;
      background: #D5E8EF;
    }
    .bbchat-messages::-webkit-scrollbar { width: 4px; }
    .bbchat-messages::-webkit-scrollbar-thumb { background: #b0cdd6; border-radius: 4px; }

    .bbchat-msg { display: flex; animation: bbchat-slide 0.3s; }
    @keyframes bbchat-slide {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .bbchat-msg.user { justify-content: flex-end; }
    .bbchat-msg.bot  { justify-content: flex-start; }

    .bbchat-bubble {
      max-width: 85%; padding: 12px 16px;
      border-radius: 12px; font-size: 14px;
      line-height: 1.5; font-weight: 400;
    }
    .bbchat-msg.bot  .bbchat-bubble { background: white; color: #2C3E50; box-shadow: 0 2px 4px rgba(0,0,0,0.08); }
    .bbchat-msg.user .bbchat-bubble { color: white; }

    .bbchat-bubble a { text-decoration: underline; word-break: break-word; }
    .bbchat-bubble a:hover { text-decoration: none; }
    .bbchat-msg.bot  .bbchat-bubble a { color: #5BA4B5; }
    .bbchat-msg.user .bbchat-bubble a { color: #FAD02C; }

    /* Quick replies */
    .bbchat-qr {
      display: flex; flex-wrap: wrap; gap: 7px;
      padding: 4px 0 2px; animation: bbchat-slide 0.3s;
    }
    .bbchat-qr-btn {
      padding: 7px 15px; border-radius: 999px;
      font-family: inherit; font-size: 13px; font-weight: 600;
      cursor: pointer; line-height: 1; white-space: nowrap;
      transition: background 0.15s, color 0.15s, transform 0.15s, box-shadow 0.15s;
    }
    .bbchat-qr-btn.primary   { background: white; }
    .bbchat-qr-btn.primary:hover   { color: white; transform: translateY(-1px); }
    .bbchat-qr-btn.secondary { background: white; }
    .bbchat-qr-btn.secondary:hover { transform: translateY(-1px); }

    /* Typing indicator */
    .bbchat-typing {
      display: flex; gap: 3px; padding: 10px;
      background: #f0f0f0; border-radius: 10px; width: fit-content;
    }
    .bbchat-dot {
      width: 6px; height: 6px; background: #999;
      border-radius: 50%; animation: bbchat-bounce 1.4s infinite;
    }
    .bbchat-dot:nth-child(2) { animation-delay: 0.2s; }
    .bbchat-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bbchat-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30%            { transform: translateY(-8px); }
    }

    /* File preview */
    .bbchat-file-preview {
      padding: 10px 14px; background: #f9f9f9;
      border-top: 1px solid #e0e0e0;
      display: none; align-items: center;
      justify-content: space-between; gap: 10px;
    }
    .bbchat-file-preview.show { display: flex; }
    .bbchat-file-preview-content { display: flex; align-items: center; gap: 10px; flex: 1; }
    .bbchat-file-preview button {
      background: none; border: none; color: #ef4444;
      cursor: pointer; padding: 4px;
      display: flex; align-items: center; justify-content: center;
    }

    /* Input area */
    .bbchat-input-wrap {
      padding: 16px 20px; display: flex;
      gap: 10px; align-items: center;
      position: relative; background: #D5E8EF; flex-shrink: 0;
    }
    .bbchat-input-wrap.drag-over { background: #e3f2fd; border-top: 2px dashed #2196f3; }

    .bbchat-drag-overlay {
      position: absolute; top:0; left:0; right:0; bottom:0;
      background: rgba(33,150,243,0.1);
      display: none; align-items: center; justify-content: center;
      pointer-events: none; z-index: 10;
    }
    .bbchat-drag-overlay.show { display: flex; }
    .bbchat-drag-overlay span {
      background: white; padding: 14px 20px; border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-size: 14px; color: #2196f3; font-weight: 600;
    }

    .bbchat-attach-btn {
      background: transparent; border: none;
      cursor: pointer; padding: 0;
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s; flex-shrink: 0;
    }
    .bbchat-attach-btn:hover { transform: scale(1.1); }
    .bbchat-attach-btn svg { width: 22px; height: 22px; }

    #bbchat-input {
      flex: 1; padding: 10px 16px;
      border: none; border-radius: 20px;
      font-size: 14px; outline: none;
      transition: box-shadow 0.3s;
      background: white; color: #2C3E50;
      font-family: inherit;
    }

    .bbchat-send-btn {
      border: none; padding: 0; background: transparent;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s; flex-shrink: 0;
    }
    .bbchat-send-btn:hover { transform: scale(1.1); }
    .bbchat-send-btn svg { width: 22px; height: 22px; }

    .bbchat-file-input { display: none; }
    .bbchat-file-att   { margin-top: 6px; font-size: 12px; opacity: 0.9; }

    @media (max-width: 768px) {
      #bbchat-container {
        width: 100vw !important; height: 100vh !important;
        bottom: 0 !important; right: 0 !important;
        top: 0 !important; left: 0 !important;
        border-radius: 0 !important;
      }
      #bbchat-btn { bottom: 20px !important; right: 20px !important; }
      #bbchat-input { font-size: 16px; }
    }
    @media (min-width: 769px) and (max-width: 1024px) {
      #bbchat-container { width: 400px; height: 500px; }
    }
  `;

  // ─── HTML TEMPLATE ─────────────────────────────────────────────────────────
  function buildHTML(cfg) {
    return `
      <button id="bbchat-btn">
        <svg viewBox="0 0 64 64">
          <rect x="8" y="12" width="44" height="32" rx="6" ry="6" fill="${cfg.accentColor}"/>
          <path d="M 16 44 L 12 52 L 20 44 Z" fill="${cfg.accentColor}"/>
          <circle cx="20" cy="28" r="3" fill="${cfg.buttonColor}"/>
          <circle cx="32" cy="28" r="3" fill="${cfg.buttonColor}"/>
          <circle cx="44" cy="28" r="3" fill="${cfg.buttonColor}"/>
        </svg>
        <span class="bbchat-btn-text">${cfg.buttonText}</span>
      </button>

      <div id="bbchat-container">
        <div class="bbchat-header" id="bbchat-header">
          <h3>${cfg.botName}</h3>
          <div class="bbchat-header-btns">
            <button id="bbchat-close" title="Close">
              <svg viewBox="0 0 24 24" fill="${cfg.primaryColor}"><path d="M7 10l5 5 5-5z"/></svg>
            </button>
          </div>
        </div>

        <div class="bbchat-messages" id="bbchat-messages"></div>

        <div class="bbchat-file-preview" id="bbchat-file-preview">
          <div class="bbchat-file-preview-content" id="bbchat-preview-content"></div>
          <button id="bbchat-remove-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div class="bbchat-input-wrap" id="bbchat-input-wrap">
          <div class="bbchat-drag-overlay" id="bbchat-drag-overlay">
            <span>📷 Drop image here</span>
          </div>
          <input class="bbchat-file-input" id="bbchat-file-input" type="file"
                 accept="image/jpeg,image/jpg,image/png" multiple>
          <button class="bbchat-attach-btn" id="bbchat-attach" title="Attach image">
            <svg viewBox="0 0 24 24" fill="${cfg.accentColor}">
              <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
            </svg>
          </button>
          <input type="text" id="bbchat-input" placeholder="${cfg.placeholder}">
          <button class="bbchat-send-btn" id="bbchat-send" title="Send">
            <svg viewBox="0 0 24 24" fill="${cfg.primaryColor}">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  // ─── POSITION HELPER ───────────────────────────────────────────────────────
  function positionStyles(position) {
    const map = {
      'bottom-right': 'bottom:20px;right:20px;top:auto;left:auto;',
      'bottom-left':  'bottom:20px;left:20px;top:auto;right:auto;',
      'top-right':    'top:20px;right:20px;bottom:auto;left:auto;',
      'top-left':     'top:20px;left:20px;bottom:auto;right:auto;',
    };
    return map[position] || map['bottom-right'];
  }

  // ─── MARKDOWN PARSER ───────────────────────────────────────────────────────
  function parseMarkdown(text) {
    if (!text) return '';
    let html = text
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');

    html = html.replace(/\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g,
      '<a href="$3" target="_blank" rel="noopener noreferrer"><img src="$2" alt="$1" style="max-width:100%;height:auto;border-radius:8px;cursor:pointer;display:block;margin:8px 0;"></a>');
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$2" alt="$1" style="max-width:100%;height:auto;border-radius:8px;display:block;margin:8px 0;">');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/(?<![\w])_([^_]+)_(?![\w])/g, '<em>$1</em>');
    html = html.replace(/\n/g, '<br>');
    return html;
  }

  // ─── AUTO BUTTON DETECTION ─────────────────────────────────────────────────
  function extractAutoButtons(text) {
    const numbered = [...text.matchAll(/^\s*\d+[\.\)]\s*\*{0,2}(.+?)\*{0,2}\s*$/gm)];
    if (numbered.length >= 2 && numbered.length <= 6)
      return numbered.map(m => m[1].trim());

    const bullets = [...text.matchAll(/^\s*[-*]\s+\*{0,2}(.+?)\*{0,2}\s*$/gm)];
    if (bullets.length >= 2 && bullets.length <= 6)
      return bullets.map(m => m[1].trim());

    const boldOr = text.match(/\*\*([^*]+)\*\*\s+or\s+(?:an?\s+)?\*\*([^*]+)\*\*/i);
    if (boldOr) return [boldOr[1].trim(), boldOr[2].trim()];

    const withDesc = text.match(/\b([A-Z][A-Za-z\s]{0,25}?)(?:\s*\([^)]*\))?\s+or\s+([A-Z][A-Za-z\s]{0,25}?)(?:\s*\([^)]*\))?[\?\.]?\s*$/);
    if (withDesc) return [withDesc[1].trim(), withDesc[2].trim()];

    const yesNo = text.match(/\(?\b(Yes|No|Maybe)\b\s+or\s+\b(Yes|No|Maybe)\b\)?/i);
    if (yesNo) return [yesNo[1].trim(), yesNo[2].trim()];

    const genericOr = text.match(/\b([A-Za-z][A-Za-z\s\-\/]{1,30}?)\s+or\s+([A-Za-z][A-Za-z\s\-\/]{1,30}?)[\?\!\.]?\s*$/);
    if (genericOr) {
      const a = genericOr[1].trim(), b = genericOr[2].trim();
      const fillers = /^(an?|the|it|this|that|more|less|very|just|also|and|but|or)$/i;
      if (!fillers.test(a) && !fillers.test(b)) return [a, b];
    }
    return [];
  }

  // ─── MAIN WIDGET CLASS ─────────────────────────────────────────────────────
  function BBChatWidget(cfg) {
    this.cfg          = Object.assign({}, DEFAULTS, cfg);
    this.messages     = [];
    this.attachedFiles = [];
    this.sessionId    = null;

    // Validate required field
    if (!this.cfg.webhookUrl) {
      console.error('[BBChat] webhookUrl is required. Example:\n  BBChat.init({ webhookUrl: "https://your-n8n.com/webhook/xxx/chat" })');
      return;
    }

    this._injectStyles();
    this._injectHTML();
    this._applyColors();
    this._bindEvents();
    this._initSession();
  }

  BBChatWidget.prototype._injectStyles = function () {
    if (document.getElementById('bbchat-styles')) return;
    const style = document.createElement('style');
    style.id = 'bbchat-styles';
    style.textContent = CSS;
    document.head.appendChild(style);
  };

  BBChatWidget.prototype._injectHTML = function () {
    const wrap = document.createElement('div');
    wrap.id = 'bbchat-root';
    wrap.innerHTML = buildHTML(this.cfg);
    document.body.appendChild(wrap);

    // Apply position
    const pos = positionStyles(this.cfg.position);
    document.getElementById('bbchat-btn').style.cssText       += pos;
    document.getElementById('bbchat-container').style.cssText += pos;
  };

  BBChatWidget.prototype._applyColors = function () {
    const cfg = this.cfg;
    const btn       = document.getElementById('bbchat-btn');
    const header    = document.getElementById('bbchat-header');
    const input     = document.getElementById('bbchat-input');
    const btnText   = btn.querySelector('.bbchat-btn-text');

    btn.style.backgroundColor    = cfg.buttonColor;
    header.style.backgroundColor = cfg.primaryColor;
    header.querySelector('h3').style.color = cfg.accentColor;
    btnText.style.color          = cfg.accentColor;

    input.addEventListener('focus', () => {
      input.style.boxShadow = `0 0 0 2px ${cfg.primaryColor}`;
    });
    input.addEventListener('blur', () => {
      input.style.boxShadow = '';
    });

    // Style the close button bg
    document.getElementById('bbchat-close').style.backgroundColor = cfg.accentColor;
  };

  BBChatWidget.prototype._bindEvents = function () {
    const self = this;

    document.getElementById('bbchat-btn').addEventListener('click',   () => self._open());
    document.getElementById('bbchat-close').addEventListener('click', () => self._close());
    document.getElementById('bbchat-send').addEventListener('click',  () => self._send());
    document.getElementById('bbchat-attach').addEventListener('click',() => document.getElementById('bbchat-file-input').click());
    document.getElementById('bbchat-remove-all').addEventListener('click', () => self._clearFiles());

    document.getElementById('bbchat-file-input').addEventListener('change', e => {
      Array.from(e.target.files).forEach(f => self._addFile(f));
      e.target.value = '';
    });

    const input = document.getElementById('bbchat-input');
    input.addEventListener('keypress', e => { if (e.key === 'Enter') self._send(); });
    input.addEventListener('paste', e => {
      for (const item of e.clipboardData.items) {
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) self._addFile(file);
        }
      }
    });

    this._setupDragDrop();
  };

  BBChatWidget.prototype._setupDragDrop = function () {
    const self        = this;
    const container   = document.getElementById('bbchat-container');
    const inputWrap   = document.getElementById('bbchat-input-wrap');
    const dragOverlay = document.getElementById('bbchat-drag-overlay');
    let dragCounter   = 0;

    ['dragenter','dragover','dragleave','drop'].forEach(ev =>
      container.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); }, false)
    );
    container.addEventListener('dragenter', e => {
      dragCounter++;
      if (e.dataTransfer.types.includes('Files')) {
        inputWrap.classList.add('drag-over');
        dragOverlay.classList.add('show');
      }
    });
    container.addEventListener('dragleave', () => {
      if (--dragCounter === 0) {
        inputWrap.classList.remove('drag-over');
        dragOverlay.classList.remove('show');
      }
    });
    container.addEventListener('drop', e => {
      dragCounter = 0;
      inputWrap.classList.remove('drag-over');
      dragOverlay.classList.remove('show');
      Array.from(e.dataTransfer.files).forEach(f => self._addFile(f));
    });
  };

  BBChatWidget.prototype._initSession = function () {
    let id = localStorage.getItem('bbchat_session');
    if (!id) {
      id = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('bbchat_session', id);
    }
    this.sessionId = id;
  };

  BBChatWidget.prototype._open = function () {
    document.getElementById('bbchat-btn').style.display = 'none';
    document.getElementById('bbchat-container').classList.add('bbchat-open');
    if (this.messages.length === 0) this._addMessage(this.cfg.welcomeMessage, 'bot');
  };

  BBChatWidget.prototype._close = function () {
    document.getElementById('bbchat-btn').style.display = 'flex';
    document.getElementById('bbchat-container').classList.remove('bbchat-open');
  };

  // ─── ADD MESSAGE ───────────────────────────────────────────────────────────
  BBChatWidget.prototype._addMessage = function (text, sender, files, buttons) {
    files = files || [];
    const messagesEl = document.getElementById('bbchat-messages');

    // Clear old quick replies when user sends
    if (sender === 'user') {
      messagesEl.querySelectorAll('.bbchat-qr').forEach(el => el.remove());
    }

    const msgDiv = document.createElement('div');
    msgDiv.className = 'bbchat-msg ' + sender;

    const bubble = document.createElement('div');
    bubble.className = 'bbchat-bubble';
    if (sender === 'user') bubble.style.backgroundColor = this.cfg.primaryColor;

    if (text) bubble.innerHTML = parseMarkdown(text);

    if (files.length > 0) {
      const grid = document.createElement('div');
      grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;';
      files.forEach(file => {
        const wrap = document.createElement('div');
        wrap.className = 'bbchat-file-att';
        if (file.type && file.type.startsWith('image/')) {
          const img = document.createElement('img');
          img.style.cssText = 'max-width:120px;max-height:120px;border-radius:6px;display:block;object-fit:cover;';
          const reader = new FileReader();
          reader.onload = e => { img.src = e.target.result; };
          reader.readAsDataURL(file);
          wrap.appendChild(img);
        } else {
          wrap.textContent = '📎 ' + file.name;
        }
        grid.appendChild(wrap);
      });
      bubble.appendChild(grid);
    }

    msgDiv.appendChild(bubble);
    messagesEl.appendChild(msgDiv);

    // Quick reply buttons
    if (sender === 'bot') {
      const finalBtns = (buttons && buttons.length > 0) ? buttons : extractAutoButtons(text || '');
      if (finalBtns.length > 0) {
        const self   = this;
        const qrWrap = document.createElement('div');
        qrWrap.className = 'bbchat-qr';

        finalBtns.forEach((label, i) => {
          const btn = document.createElement('button');
          btn.className = 'bbchat-qr-btn ' + (i % 2 === 0 ? 'primary' : 'secondary');
          btn.textContent = label;

          // Apply colors dynamically
          if (i % 2 === 0) {
            btn.style.border = `2px solid ${this.cfg.primaryColor}`;
            btn.style.color  = this.cfg.primaryColor;
            btn.addEventListener('mouseenter', () => { btn.style.background = this.cfg.primaryColor; btn.style.color = 'white'; });
            btn.addEventListener('mouseleave', () => { btn.style.background = 'white'; btn.style.color = this.cfg.primaryColor; });
          } else {
            btn.style.border = `2px solid ${this.cfg.accentColor}`;
            btn.style.color  = '#8a6a00';
            btn.addEventListener('mouseenter', () => { btn.style.background = this.cfg.accentColor; btn.style.color = '#5a4000'; });
            btn.addEventListener('mouseleave', () => { btn.style.background = 'white'; btn.style.color = '#8a6a00'; });
          }

          btn.addEventListener('click', () => {
            messagesEl.querySelectorAll('.bbchat-qr').forEach(el => el.remove());
            document.getElementById('bbchat-input').value = label;
            self._send();
          });

          qrWrap.appendChild(btn);
        });
        messagesEl.appendChild(qrWrap);
      }
    }

    this.messages.push({ text, sender, files, timestamp: new Date() });
    this._scrollToBottom();
  };

  // ─── TYPING INDICATOR ──────────────────────────────────────────────────────
  BBChatWidget.prototype._showTyping = function () {
    const el = document.createElement('div');
    el.className = 'bbchat-msg bot';
    el.id = 'bbchat-typing';
    el.innerHTML = '<div class="bbchat-typing"><div class="bbchat-dot"></div><div class="bbchat-dot"></div><div class="bbchat-dot"></div></div>';
    document.getElementById('bbchat-messages').appendChild(el);
    this._scrollToBottom();
  };

  BBChatWidget.prototype._hideTyping = function () {
    document.getElementById('bbchat-typing')?.remove();
  };

  BBChatWidget.prototype._scrollToBottom = function () {
    const el = document.getElementById('bbchat-messages');
    el.scrollTop = el.scrollHeight;
  };

  // ─── FILE HANDLING ─────────────────────────────────────────────────────────
  BBChatWidget.prototype._addFile = function (file) {
    const allowed = ['image/jpeg','image/jpg','image/png'];
    if (this.attachedFiles.length >= this.cfg.maxImages) { alert(`Maximum ${this.cfg.maxImages} images allowed`); return; }
    if (!allowed.includes(file.type.toLowerCase())) { alert('Only JPG and PNG images are allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be less than 5MB'); return; }
    this.attachedFiles.push(file);
    this._renderFilePreviews();
  };

  BBChatWidget.prototype._clearFiles = function () {
    this.attachedFiles = [];
    document.getElementById('bbchat-file-input').value = '';
    this._renderFilePreviews();
  };

  BBChatWidget.prototype._renderFilePreviews = function () {
    const self    = this;
    const preview = document.getElementById('bbchat-file-preview');
    const content = document.getElementById('bbchat-preview-content');
    content.innerHTML = '';

    if (this.attachedFiles.length === 0) { preview.classList.remove('show'); return; }
    preview.classList.add('show');

    this.attachedFiles.forEach((file, i) => {
      const item = document.createElement('div');
      item.style.cssText = 'display:flex;align-items:center;gap:8px;margin-right:8px;';

      const thumb = document.createElement('img');
      thumb.style.cssText = 'width:40px;height:40px;object-fit:cover;border-radius:6px;border:2px solid #e0e0e0;';
      const reader = new FileReader();
      reader.onload = e => { thumb.src = e.target.result; };
      reader.readAsDataURL(file);

      const rmBtn = document.createElement('button');
      rmBtn.innerHTML = '×';
      rmBtn.style.cssText = 'background:#ef4444;color:white;border:none;border-radius:50%;width:18px;height:18px;cursor:pointer;font-size:14px;line-height:1;';
      rmBtn.onclick = () => { self.attachedFiles.splice(i, 1); self._renderFilePreviews(); };

      item.appendChild(thumb);
      item.appendChild(rmBtn);
      content.appendChild(item);
    });
  };

  // ─── EXTRACT n8n RESPONSE ──────────────────────────────────────────────────
  BBChatWidget.prototype._extractResponse = function (data) {
    if (typeof data === 'string') return data;
    const fields = ['output','response','message','text','reply','answer','result','data'];
    for (const f of fields) {
      if (data[f]) {
        if (typeof data[f] === 'string') return data[f];
        if (typeof data[f] === 'object' && (data[f].text || data[f].message))
          return data[f].text || data[f].message;
      }
    }
    if (Array.isArray(data) && data.length > 0) return this._extractResponse(data[0]);
    return null;
  };

  // ─── SEND MESSAGE ──────────────────────────────────────────────────────────
  BBChatWidget.prototype._send = async function () {
    const input      = document.getElementById('bbchat-input');
    const sendBtn    = document.getElementById('bbchat-send');
    const attachBtn  = document.getElementById('bbchat-attach');
    const message    = input.value.trim();

    if (!message && this.attachedFiles.length === 0) return;

    const filesToSend = [...this.attachedFiles];
    this._addMessage(message, 'user', filesToSend);
    input.value = '';
    this._clearFiles();

    // Disable UI
    [input, sendBtn, attachBtn].forEach(el => { el.disabled = true; el.style.opacity = '0.6'; });
    this._showTyping();

    const history = this.messages.slice(-5).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }));

    try {
      let response;

      if (filesToSend.length > 0) {
        const fd = new FormData();
        ['message','text','input','chatInput'].forEach(k => fd.append(k, message));
        fd.append('timestamp', new Date().toISOString());
        fd.append('sessionId', this.sessionId);
        fd.append('history',   JSON.stringify(history));
        filesToSend.forEach(f => fd.append('files', f, f.name));
        response = await fetch(this.cfg.webhookUrl, { method: 'POST', mode: 'cors', body: fd });
      } else {
        response = await fetch(this.cfg.webhookUrl, {
          method: 'POST', mode: 'cors',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            message, text: message, input: message, chatInput: message,
            action: 'sendMessage',
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            history
          })
        });
      }

      if (!response.ok) throw new Error('HTTP ' + response.status);

      const raw  = await response.text();
      let   data;
      try { data = JSON.parse(raw); } catch(e) { data = { output: raw }; }

      const botText    = this._extractResponse(data);
      const botButtons = Array.isArray(data.buttons) ? data.buttons : [];

      setTimeout(() => {
        this._hideTyping();
        this._addMessage(botText || "I received your message but couldn't process the response.", 'bot', [], botButtons);
        [input, sendBtn, attachBtn].forEach(el => { el.disabled = false; el.style.opacity = '1'; });
        input.focus();
      }, 500);

    } catch (err) {
      setTimeout(() => {
        this._hideTyping();
        let msg = "Sorry, I couldn't connect to the server.\n\n";
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          msg += '❌ Check:\n1. CORS settings in n8n\n2. Webhook URL is correct\n3. Workflow is active';
        } else {
          msg += 'Error: ' + err.message;
        }
        this._addMessage(msg, 'bot');
        [input, sendBtn, attachBtn].forEach(el => { el.disabled = false; el.style.opacity = '1'; });
        input.focus();
      }, 500);
    }
  };

  // ─── PUBLIC API ────────────────────────────────────────────────────────────
  global.BBChat = {
    /**
     * Initialize the chat widget.
     *
     * @param {Object} options
     * @param {string} options.webhookUrl     REQUIRED — your n8n webhook URL
     * @param {string} [options.botName]      Bot name shown in header
     * @param {string} [options.welcomeMessage] First message shown
     * @param {string} [options.placeholder]  Input placeholder text
     * @param {string} [options.buttonText]   Launch button label
     * @param {string} [options.position]     'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
     * @param {string} [options.primaryColor] Main teal color  (default #5BA4B5)
     * @param {string} [options.buttonColor]  Toggle button bg (default #007D99)
     * @param {string} [options.accentColor]  Yellow accent    (default #FAD02C)
     * @param {number} [options.maxImages]    Max file uploads (default 3)
     */
    init: function (options) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new BBChatWidget(options));
      } else {
        new BBChatWidget(options);
      }
    }
  };

}(window));