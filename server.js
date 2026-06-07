const http = require('http');
const fs = require('fs/promises');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 3000);
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const MODEL = 'meta/llama-4-maverick-17b-128e-instruct';
const AI_TIMEOUT_MS = Number(process.env.JESSY_AI_TIMEOUT_MS || 4_000);
const ROOT = __dirname;
const ROUTE_FILES = {
  '/ai': '/jessy-ai.html',
  '/jessy-ai': '/jessy-ai.html',
  '/pricing': '/pricing.html',
  '/prices': '/pricing.html',
  '/styles': '/styles.html',
  '/showroom': '/showroom.html',
  '/show-room': '/showroom.html',
  '/about': '/about.html'
};
const MAX_BODY_BYTES = 12_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const requestLog = new Map();

const SYSTEM_PROMPT = `
You are Jessy AI, the fast, warm beauty concierge for Jessy Nailed It, a Lagos beauty studio.
You help clients choose lash styles, nail sets, hair styling, braids, wig installs, appointment prep, aftercare, and pricing.
Business facts:
- Services: Nail Artistry, Hair Styling, Lash Extensions.
- Nails include gel polish, acrylic full sets, gel extensions, ombre, 3D art, chrome, French manicure, infills, rhinestones, removals.
- Hair includes box braids, knotless braids, goddess braids, weave installs, wig customization, treatments, twist outs, relaxer, cornrows, coloring.
- Lashes include classic, hybrid, volume, mega volume, wispy/Kim K, lash lift and tint, fills, removal, bottom lashes.
- Location: Lagos, Nigeria. WhatsApp booking: 09076649660.
- Hours: Monday to Saturday, 8am to 8pm.
- Price guide: nails from ₦3,500, hair from ₦5,000, lashes from ₦7,500. Tell users final price depends on length, design, volume, and service details.
Style:
- Reply in 2-5 short paragraphs or concise bullets.
- Be helpful, stylish, confident, and practical.
- Ask at most one clarifying question when needed.
- Recommend a clear service and next step.
- Encourage WhatsApp booking when the user is ready.
Safety:
- Do not diagnose medical conditions. For allergies, pain, swelling, infection, or eye irritation, advise pausing service and seeking a qualified professional.
- Do not promise impossible results or exact availability.
`;

function createLocalBeautyReply(message) {
  const text = message.toLowerCase();
  const mentions = (...terms) => terms.some(term => text.includes(term));

  if (mentions('allergy', 'allergic', 'swollen', 'swelling', 'infection', 'infected', 'burning', 'pain', 'red eye', 'irritation')) {
    return [
      'Pause the beauty service for now and do not apply more product around the irritated area.',
      'For eye irritation, swelling, infection signs, burning or strong pain, it is safest to speak with a qualified health professional before booking lashes, nails or chemical hair services.',
      'When you are cleared, Jessy can help choose a gentle, lower-risk look and aftercare plan.'
    ].join('\n\n');
  }

  if (mentions('lash', 'lashes', 'wispy', 'classic', 'hybrid', 'volume', 'mega', 'eye')) {
    return [
      'My quick pick: go for a hybrid wispy lash set if you want natural but still glam. It gives soft texture, visible length and a pretty eye-opening effect without looking too heavy.',
      'Choose classic for the most natural look, hybrid for everyday glam, volume for fuller photos, and mega volume only if you love a bold dramatic finish.',
      'Best next step: send Jessy a selfie or inspo photo on WhatsApp and mention your eye shape, whether you wear glasses, and if you want natural, soft glam or dramatic.'
    ].join('\n\n');
  }

  if (mentions('braid', 'braids', 'knotless', 'goddess', 'cornrow', 'protective')) {
    return [
      'For a protective style that still looks expensive, I would choose medium knotless braids or goddess braids. Knotless is lighter on the scalp, while goddess braids give a softer, more feminine finish.',
      'For Lagos heat, keep the size medium, avoid too much tension, and use mousse plus light scalp oil for maintenance.',
      'Best next step: send your preferred length, color and fullness to Jessy on WhatsApp so she can confirm timing and final price.'
    ].join('\n\n');
  }

  if (mentions('hair', 'wig', 'weave', 'install', 'color', 'styling', 'natural')) {
    return [
      'For a polished hair upgrade, choose a wig customization or weave install if you want a quick transformation, or knotless/goddess braids if you want a longer-lasting protective look.',
      'If your hair needs care first, book a treatment before heavy styling. Healthy prep makes the final look cleaner and helps it last longer.',
      'Tell Jessy your hair length, the style photo, and whether you want sleek, curly, colored or low-maintenance.'
    ].join('\n\n');
  }

  if (mentions('nail', 'nails', 'acrylic', 'gel', 'chrome', 'french', 'rhinestone', 'ombre', 'birthday')) {
    return [
      'For a high-impact set, choose gel extensions or acrylics with pink ombre, chrome accents and a few rhinestones. It looks glam in photos without becoming too busy.',
      'For everyday elegance, go shorter with French tips or soft nude gel. For birthdays and events, go longer with 3D art, chrome or crystals.',
      'Best next step: send your inspo photo, preferred length and shape to Jessy so she can price the design properly.'
    ].join('\n\n');
  }

  if (mentions('price', 'cost', 'how much', '₦', 'naira', 'budget')) {
    return [
      'Here is the quick price guide: nails start from ₦3,500, hair starts from ₦5,000, and lashes start from ₦7,500.',
      'Final price depends on length, volume, design detail, color, add-ons and service time. For the most accurate quote, send Jessy your inspo photo on WhatsApp.',
      'If you want, tell me your budget and occasion and I will suggest the best look inside it.'
    ].join('\n\n');
  }

  if (mentions('book', 'appointment', 'slot', 'available', 'whatsapp')) {
    return [
      'To book, message Jessy on WhatsApp at 09076649660 with your service, inspo photo, preferred date and location area in Lagos.',
      'Appointments run Monday to Saturday, 8am to 8pm. Slots can fill quickly, so sending the details upfront helps confirm faster.',
      'If you are unsure what to book, tell me your event and the vibe you want: natural, soft glam, luxury, dramatic or low-maintenance.'
    ].join('\n\n');
  }

  return [
    'I can help you build the perfect glam plan. My best starting point is: choose one focus area first, then match the rest around it.',
    'For natural glam, try hybrid lashes, soft pink/nude gel nails and clean hair styling. For event glam, go for wispy volume lashes, chrome or rhinestone nails, and a sleek wig install or goddess braids.',
    'Tell me your occasion, budget and whether you want nails, hair, lashes or all three, and I will narrow it down.'
  ].join('\n\n');
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, status, body, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': contentType,
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(body);
}

function clientIp(req) {
  return (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown')
    .toString()
    .split(',')[0]
    .trim();
}

function isRateLimited(ip) {
  const now = Date.now();
  const bucket = requestLog.get(ip) || [];
  const recent = bucket.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  requestLog.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let body = '';

    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('Request body too large.'));
        req.destroy();
        return;
      }
      body += chunk;
    });

    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function normalizeMessages(messages, message) {
  const source = Array.isArray(messages) ? messages : [{ role: 'user', content: message }];
  return source
    .filter(item => item && ['user', 'assistant'].includes(item.role) && typeof item.content === 'string')
    .slice(-8)
    .map(item => ({
      role: item.role,
      content: item.content.replace(/\s+/g, ' ').trim().slice(0, 1200)
    }))
    .filter(item => item.content.length > 0);
}

async function handleJessyAi(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed.' });
    return;
  }

  if (isRateLimited(clientIp(req))) {
    sendJson(res, 429, { error: 'Jessy AI is getting a lot of requests. Please try again in a minute.' });
    return;
  }

  let latestMessage = '';

  try {
    const rawBody = await readBody(req);
    const body = JSON.parse(rawBody || '{}');
    const messages = normalizeMessages(body.messages, body.message);

    if (!messages.length || messages[messages.length - 1].role !== 'user') {
      sendJson(res, 400, { error: 'Please send a message for Jessy AI.' });
      return;
    }

    latestMessage = messages[messages.length - 1].content;

    if (!NVIDIA_API_KEY) {
      sendJson(res, 200, {
        reply: createLocalBeautyReply(latestMessage),
        fallback: true
      });
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    const response = await fetch(NVIDIA_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        max_tokens: 220,
        temperature: 0.68,
        top_p: 0.9,
        frequency_penalty: 0.15,
        presence_penalty: 0.05,
        stream: false
      })
    });

    clearTimeout(timeout);

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      sendJson(res, 200, {
        reply: createLocalBeautyReply(latestMessage),
        fallback: true
      });
      return;
    }

    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      sendJson(res, 200, {
        reply: createLocalBeautyReply(latestMessage),
        fallback: true
      });
      return;
    }

    sendJson(res, 200, { reply });
  } catch (error) {
    if (latestMessage) {
      sendJson(res, 200, {
        reply: createLocalBeautyReply(latestMessage),
        fallback: true
      });
    } else {
      sendJson(res, 500, {
        error: 'Jessy AI had a problem. Please try again.'
      });
    }
  }
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(url.pathname);
  const cleanPath = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
  const requestedPath = cleanPath === '/' ? '/index.html' : ROUTE_FILES[cleanPath] || pathname;
  const filePath = path.normalize(path.join(ROOT, requestedPath));

  if (!filePath.startsWith(ROOT)) {
    sendText(res, 403, 'Forbidden');
    return;
  }

  try {
    const file = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    sendText(res, 200, file, MIME_TYPES[ext] || 'application/octet-stream');
  } catch {
    sendText(res, 404, 'Not found');
  }
}

const server = http.createServer(async (req, res) => {
  if (req.url?.startsWith('/api/jessy-ai')) {
    await handleJessyAi(req, res);
    return;
  }

  await serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Jessy Nailed It is running at http://localhost:${PORT}`);
  if (!NVIDIA_API_KEY) {
    console.log('Jessy AI is using the built-in fast beauty fallback until NVIDIA_API_KEY is set.');
  }
});
