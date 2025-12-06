require('dotenv').config();
console.log("DEBUG ENV →", {
  LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID,
  LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET
});
console.log("LinkedIn Client ID:", process.env.LINKEDIN_CLIENT_ID);
console.log("LinkedIn Client Secret:", process.env.LINKEDIN_CLIENT_SECRET ? "[loaded]" : "[missing]");
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 4000;
const FRONTEND_URL = 'http://localhost:5174';
// Allow any localhost origin during development
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// --- IN-MEMORY TOKEN STORAGE ---
// In production, use a database (Redis, Postgres, MongoDB)
// Structure: { 'demo-user': { x: { accessToken, ... }, facebook: { ... } } }
const USER_TOKENS = {
  'demo-user': {
    x: null,
    facebook: null,
    linkedin: null
  }
};

const getTokens = (userId) => USER_TOKENS[userId] || {};
const saveToken = (userId, provider, tokenData) => {
  if (!USER_TOKENS[userId]) USER_TOKENS[userId] = {};
  USER_TOKENS[userId][provider] = tokenData;
};

// --- OAUTH CONFIGURATION ---
// Get these from:
// X: https://developer.twitter.com/en/portal/dashboard
// Facebook: https://developers.facebook.com/
// LinkedIn: https://www.linkedin.com/developers/
const CONFIG = {
  x: {
    clientId: process.env.X_CLIENT_ID,
    clientSecret: process.env.X_CLIENT_SECRET,
    redirectUri: 'http://localhost:4000/auth/x/callback',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    // Scopes for posting tweets and reading user info
    scopes: 'tweet.read tweet.write users.read offline.access'
  },
  facebook: {
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    redirectUri: 'http://localhost:4000/auth/facebook/callback',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    // Scopes for managing pages
    scopes: 'pages_show_list,pages_read_engagement,pages_manage_posts' 
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    redirectUri: 'http://localhost:4000/auth/linkedin/callback',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    // Scopes for sharing content
    scopes: 'w_member_social profile openid email'
  }
};

// --- AUTH ROUTES ---

// 1. Start OAuth Flow
app.get('/auth/:provider/start', (req, res) => {
  const { provider } = req.params;
  const config = CONFIG[provider];
  
  if (!config) return res.status(400).json({ error: 'Invalid provider' });

  // Generate a random state for CSRF protection
  const state = Math.random().toString(36).substring(7);
  
  // Store state in cookie to verify later
  res.cookie(`${provider}_auth_state`, state, { httpOnly: true, maxAge: 300000 });

  // Build Authorization URL
  let authUrl = '';
  
  if (provider === 'x') {
    // X (Twitter) requires code_challenge (PKCE) - simplified for demo, usually required
    authUrl = `${config.authUrl}?response_type=code&client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&scope=${encodeURIComponent(config.scopes)}&state=${state}&code_challenge=challenge&code_challenge_method=plain`;
  } else if (provider === 'linkedin') {
    authUrl = `${config.authUrl}?response_type=code&client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&scope=${encodeURIComponent(config.scopes)}&state=${state}`;
  } else if (provider === 'facebook') {
    authUrl = `${config.authUrl}?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&scope=${encodeURIComponent(config.scopes)}&state=${state}`;
  }

  res.json({ url: authUrl });
});

// 2. OAuth Callback
app.get('/auth/:provider/callback', async (req, res) => {
  const { provider } = req.params;
  const { code, state } = req.query;
  const config = CONFIG[provider];

  // Verify state (basic CSRF check)
  // const savedState = req.cookies[`${provider}_auth_state`];
  // if (state !== savedState) return res.status(403).send('Invalid state');

  try {
    let tokenData = {};

    // Exchange Code for Token
    if (provider === 'x') {
      const authHeader = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
      const response = await axios.post(config.tokenUrl, 
        querystring.stringify({
          code,
          grant_type: 'authorization_code',
          client_id: config.clientId,
          redirect_uri: config.redirectUri,
          code_verifier: 'challenge' // Matching the plain text challenge sent in start
        }), {
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${authHeader}`
          }
        }
      );
      tokenData = response.data;
    } 
    else if (provider === 'linkedin') {
      const response = await axios.post(config.tokenUrl, querystring.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri
      }));
      tokenData = response.data;
    }
    else if (provider === 'facebook') {
      const response = await axios.get(config.tokenUrl, {
        params: {
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: config.redirectUri,
          code
        }
      });
      tokenData = response.data;
    }

    // Save token to memory
    saveToken('demo-user', provider, tokenData);
    console.log(`✅ [${provider}] Linked successfully for demo-user`);

    // Redirect back to frontend
    res.redirect(`${FRONTEND_URL}?connected=${provider}`);

  } catch (error) {
    console.error(`Auth Error [${provider}]:`, error.response?.data || error.message);
    res.redirect(`${FRONTEND_URL}?error=${provider}_failed`);
  }
});

// --- PUBLISH ROUTES ---

app.post('/publish/:provider', async (req, res) => {
  const { provider } = req.params;
  const { content } = req.body;
  const tokens = getTokens('demo-user')[provider];

  if (!tokens || !tokens.access_token) {
    return res.status(401).json({ success: false, error: 'Not connected' });
  }

  try {
    let result;

    if (provider === 'x') {
      // Post Tweet (v2 API)
      const response = await axios.post('https://api.twitter.com/2/tweets', 
        { text: content },
        { headers: { Authorization: `Bearer ${tokens.access_token}` } }
      );
      result = response.data;
    } 
    else if (provider === 'linkedin') {
        // 1. Get User ID (sub) first
        const profile = await axios.get('https://api.linkedin.com/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
        });
        const personId = profile.data.sub;

        // 2. Post UGC
        const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', {
            "author": `urn:li:person:${personId}`,
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": { "text": content },
                    "shareMediaCategory": "NONE"
                }
            },
            "visibility": { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
        }, { headers: { Authorization: `Bearer ${tokens.access_token}` } });
        result = response.data;
    }
    else if (provider === 'facebook') {
      // Note: Typically you post to a Page, not a User Profile (deprecated).
      // For this demo, we assume the user has 1 page and we post to the first one.
      
      // 1. Get Pages
      const pagesParams = { access_token: tokens.access_token };
      const pagesRes = await axios.get('https://graph.facebook.com/v18.0/me/accounts', { params: pagesParams });
      
      if (pagesRes.data.data.length === 0) throw new Error("No Facebook Pages found.");
      
      const pageId = pagesRes.data.data[0].id;
      const pageToken = pagesRes.data.data[0].access_token;

      // 2. Post to Page Feed
      const response = await axios.post(`https://graph.facebook.com/v18.0/${pageId}/feed`, 
        { message: content, access_token: pageToken }
      );
      result = response.data;
    }

    res.json({ success: true, data: result });

  } catch (error) {
    console.error(`Publish Error [${provider}]:`, error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`SocialSync Backend running on http://localhost:${PORT}`);
});