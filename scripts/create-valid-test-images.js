const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const analysisDir = path.join(__dirname, '..', 'tests', 'fixtures', 'images', 'analysis');

const testImages = [
  { name: 'portrait-lighting.jpg', color: { r: 255, g: 200, b: 150 } },
  { name: 'landscape-composition.jpg', color: { r: 100, g: 150, b: 200 } },
  { name: 'colorful-palette.jpg', color: { r: 255, g: 100, b: 100 } },
  { name: 'impressionist-style.jpg', color: { r: 200, g: 255, b: 200 } },
  { name: 'low-quality.jpg', color: { r: 128, g: 128, b: 128 } },
  { name: 'inappropriate-content.jpg', color: { r: 50, g: 50, b: 50 } }
];

async function createTestImages() {
  // 确保目录存在
  if (!fs.existsSync(analysisDir)) {
    fs.mkdirSync(analysisDir, { recursive: true });
  }

  for (const imageInfo of testImages) {
    const filePath = path.join(analysisDir, imageInfo.name);

    // 创建 200x200 像素的纯色 JPEG 图片
    await sharp({
      create: {
        width: 200,
        height: 200,
        channels: 3,
        background: imageInfo.color
      }
    })
    .jpeg({ quality: 90 })
    .toFile(filePath);

    console.log(`Created: ${filePath}`);
  }

  console.log('All test images created successfully!');
}

createTestImages().catch(console.error);
