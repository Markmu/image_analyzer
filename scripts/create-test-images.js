const fs = require('fs');
const path = require('path');

// 创建一个简单的 1x1 像素的 JPEG 图片（最小有效 JPEG）
// 这是一个 base64 编码的最小 JPEG 文件
const minimalJpeg = Buffer.from(
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVN//2Q==',
  'base64'
);

const analysisDir = path.join(__dirname, '..', 'tests', 'fixtures', 'images', 'analysis');

const testImages = [
  'portrait-lighting.jpg',
  'landscape-composition.jpg',
  'colorful-palette.jpg',
  'impressionist-style.jpg',
  'low-quality.jpg',
  'inappropriate-content.jpg'
];

testImages.forEach(filename => {
  const filePath = path.join(analysisDir, filename);
  fs.writeFileSync(filePath, minimalJpeg);
  console.log(`Created: ${filePath}`);
});

console.log('All test images created successfully!');
