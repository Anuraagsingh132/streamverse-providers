const AbortController = require('abort-controller');
const express = require("express");
const fetch = require("node-fetch");
const chalk = require("chalk");

const app = express();
const PORT = process.env.PORT || 3000;

const sources = [
 
  (id) => `https://vidlink.pro/movie/${id}?primaryColor=#FFFFFF&secondaryColor=#FFFFFF&iconColor=#FFFFFF&autoplay=false`,
  (id) => `https://vidsrc.to/embed/movie/${id}`,
  (id) => `https://moviesapi.club/movie/${id}`,
  (id) => `https://vidsrc.xyz/embed/movie/${id}`,
  (id) => `https://vidsrc.su/embed/movie/${id}`,
  (id) => `https://vidsrc.vip/embed/movie/${id}`,
  (id) => `https://player.autoembed.cc/embed/movie/${id}`,
  (id) => `https://player.smashy.stream/movie/${id}`,
  (id) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`,
  (id) => `https://vidsrc.icu/embed/movie/${id}`,
  (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,




  
  (id) => `https://www.2embed.cc/embed/${id}`,
  (id) => `https://www.nontongo.win/embed/movie/${id}`,
  (id) => `https://vidlink.pro/movie/${id}?player=jw&multiLang=true&primaryColor=#FFFFFF&secondaryColor=#FFFFFF&iconColor=#FFFFFF`,
  (id) => `https://vidbinge.dev/embed/movie/${id}`,
  
  (id) => `https://2anime.xyz/embed/${id}-episode-1`,
  (id) => `https://embed.su/embed/movie/${id}`,
];

const ERROR_INDICATORS = [
  "404", "not found", "page not found", "video not available", "error", "no video", "movie not available", "invalid", "oops"
];

async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 8000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

function containsErrorIndicators(html) {
  const lower = html.toLowerCase();
  return ERROR_INDICATORS.some(keyword => lower.includes(keyword));
}

app.get("/", (req, res) => {
  res.send(`
    <h1>🎬 Embed API Running</h1>
    <p>Use <code>/api/embed/:id</code> to get a working movie stream embed URL.</p>
  `);
});

app.get("/api/embed/:id", async (req, res) => {
  const id = req.params.id;
  console.log(chalk.blueBright(`📥 Received request for movie ID: ${id}`));

  for (const buildUrl of sources) {
    const url = buildUrl(id);
    console.log(chalk.yellow(`🔎 Checking URL: ${url}`));

    try {
      const response = await fetchWithTimeout(url, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "text/html",
        },
      });

      const html = await response.text();
      const isFakeOk = containsErrorIndicators(html);

      console.log(
        chalk.gray(`📡 Response from ${url}: ${response.status} ${response.statusText}`)
      );

      if (response.ok && !isFakeOk) {
        console.log(chalk.green(`✅ Found working stream: ${url}`));
        return res.json({ url });
      } else {
        console.log(chalk.red(`❌ Fake or error page detected: ${url}`));
      }
    } catch (err) {
      console.log(chalk.red(`⚠️ Error checking ${url}: ${err.message}`));
    }
  }

  console.log(chalk.redBright("🚫 No working stream found for this ID."));
  res.status(404).json({ error: "No working stream found" });
});

app.listen(PORT, () =>
  console.log(chalk.greenBright(`✅ Server running on http://localhost:${PORT}`))
);
