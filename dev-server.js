import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  let filePath = join(__dirname, req.url === '/' ? '/game-with-textures.html' : req.url);
  const ext = extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  try {
    if (existsSync(filePath)) {
      const content = readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head><title>404 - File Not Found</title></head>
          <body>
            <h1>404 - File Not Found</h1>
            <p>The requested file "${req.url}" was not found.</p>
            <p><a href="/">Go to Game</a></p>
          </body>
        </html>
      `);
    }
  } catch (error) {
    console.error('Error serving file:', error);
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head><title>500 - Server Error</title></head>
        <body>
          <h1>500 - Server Error</h1>
          <p>An error occurred while serving the file.</p>
        </body>
      </html>
    `);
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Development server running at http://localhost:${PORT}`);
  console.log(`🎮 Game URL: http://localhost:${PORT}/game-with-textures.html`);
  console.log(`🧪 Texture Test: http://localhost:${PORT}/simple-texture-test.html`);
  console.log(`📖 Texture Preview: http://localhost:${PORT}/texture-preview.html`);
  console.log('\n按 Ctrl+C 停止服務器');
});
