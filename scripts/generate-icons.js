// 简单的图标生成脚本
// 由于没有图像处理库，我们创建一个简单的 HTML 页面来生成图标

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

// 确保目录存在
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 为每个尺寸创建 SVG（可以在浏览器中转换为 PNG）
sizes.forEach(size => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0891b2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="100" fill="url(#grad)"/>
  <rect x="156" y="96" width="200" height="320" rx="24" fill="#1e293b"/>
  <rect x="176" y="136" width="160" height="240" rx="8" fill="#0f172a"/>
  <circle cx="256" cy="400" r="16" fill="#475569"/>
  <text x="256" y="280" font-family="Arial" font-size="72" font-weight="bold" fill="#0891b2" text-anchor="middle">W3</text>
</svg>`;
  
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.svg`), svg);
  console.log(`Created icon-${size}x${size}.svg`);
});

console.log('\\nIcons created! To convert to PNG, open each SVG in a browser and save as PNG.');
console.log('Or use an online converter like https://svgtopng.com/');
