const express = require("express");
const fetch = require("node-fetch");
const chalk = require("chalk");

const app = express();
const PORT = process.env.PORT || 3000;

const sources = [
  (id) => `https://embed.su/embed/movie/${id}`,
  (id) => `https://player.autoembed.cc/embed/movie/${id}`,
  (id) => `https://player.smashy.stream/movie/${id}`,
  (id) => `https://vidsrc.xyz/embed/movie/${id}`,
  (id) => `https://2anime.xyz/embed/${id}-episode-1`,
  (id) => `https://www.2embed.cc/embed/${id}`,
  (id) => `https://www.nontongo.win/embed/movie/${id}`,
  (id) => `https://vidlink.pro/movie/${id}?primaryColor=#FFFFFF&secondaryColor=#FFFFFF&iconColor=#FFFFFF&autoplay=false`,
  (id) => `https://vidlink.pro/movie/${id}?player=jw&multiLang=true&primaryColor=#FFFFFF&secondaryColor=#FFFFFF&iconColor=#FFFFFF`,
  (id) => `https://vidbinge.dev/embed/movie/${id}`,
  (id) => `https://moviesapi.club/movie/${id}`,
  (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
  (id) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`,
  (id) => `https://vidsrc.icu/embed/movie/${id}`,
  (id) => `https://vidsrc.su/embed/movie/${id}`,
  (id) => `https://vidsrc.to/embed/movie/${id}`,
  (id) => `https://vidsrc.vip/embed/movie/${id}`
];

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
      const response = await fetch(url, { method: "HEAD" });
      console.log(
        chalk.gray(`📡 Response from ${url}: ${response.status} ${response.statusText}`)
      );

      if (response.ok) {
        console.log(chalk.green(`✅ Found working stream: ${url}`));
        return res.json({ url });
      } else {
        console.log(chalk.red(`❌ Not OK: ${url}`));
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
