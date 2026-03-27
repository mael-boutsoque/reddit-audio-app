import type { VercelRequest, VercelResponse } from '@vercel/node';

// Reddit OAuth credentials - these should be set in Vercel env vars
const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID || '';
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET || '';

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getRedditToken(): Promise<string | null> {
  // Return cached token if still valid
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET) {
    console.error('Missing Reddit OAuth credentials');
    return null;
  }

  try {
    const auth = Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString('base64');
    
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'RedditAudioApp/1.0',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      console.error('Failed to get Reddit token:', response.status);
      return null;
    }

    const data = await response.json() as { access_token: string; expires_in: number };
    accessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
    
    return accessToken;
  } catch (error) {
    console.error('Error getting Reddit token:', error);
    return null;
  }
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

  const token = await getRedditToken();
  
  if (!token) {
    res.status(500).json({ 
      error: 'Reddit API authentication failed. Please set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET environment variables.' 
    });
    return;
  }

  try {
    let redditPath = path;
    if (!redditPath.endsWith('.json')) {
      redditPath = `${redditPath}.json`;
    }
    
    const redditUrl = `https://oauth.reddit.com${redditPath}`;
    const url = new URL(redditUrl);
    
    Object.entries(req.query).forEach(([key, value]) => {
      if (key !== 'path' && value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'RedditAudioApp/1.0',
        'Accept': 'application/json',
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
