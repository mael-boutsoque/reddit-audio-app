import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple Reddit proxy using public JSON API with rotation
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { path } = req.query;
  
  if (!path || typeof path !== 'string') {
    res.status(400).json({ error: 'Missing path parameter' });
    return;
  }

  try {
    let redditPath = path;
    if (!redditPath.endsWith('.json')) {
      redditPath = `${redditPath}.json`;
    }
    
    const redditUrl = `https://www.reddit.com${redditPath}`;
    const url = new URL(redditUrl);
    
    Object.entries(req.query).forEach(([key, value]) => {
      if (key !== 'path' && value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });

    const userAgent = getRandomUserAgent();
    
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'application/json, text/html, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
      },
    });

    if (!response.ok) {
      res.status(response.status).json({ 
        error: `Reddit API error: ${response.status}` 
      });
      return;
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch from Reddit' });
  }
}
