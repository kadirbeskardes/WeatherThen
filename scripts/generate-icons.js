/**
 * Icon Generator for WeatherThen
 * 
 * Bu script'i çalıştırmak için:
 * 1. npm install canvas
 * 2. node scripts/generate-icons.js
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Renk paleti
const colors = {
  background: '#4A90E2',      // Ana mavi
  backgroundGradient: '#67B8DE', // Açık mavi
  sun: '#FFD700',             // Altın sarı
  sunGlow: '#FFA500',         // Turuncu
  cloud: '#FFFFFF',           // Beyaz
  cloudShadow: '#E8E8E8',     // Gri
};

function drawWeatherIcon(ctx, size, isAdaptive = false) {
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Adaptive icon için daha küçük çizim alanı (kenarlardan %20 boşluk)
  const scale = isAdaptive ? 0.6 : 0.8;
  const baseSize = size * scale;
  const offsetX = (size - baseSize) / 2;
  const offsetY = (size - baseSize) / 2;

  // Arka plan gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, colors.background);
  gradient.addColorStop(1, colors.backgroundGradient);
  
  // Yuvarlak köşeli arka plan (sadece normal icon için)
  if (!isAdaptive) {
    const radius = size * 0.2;
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, radius);
    ctx.fillStyle = gradient;
    ctx.fill();
  } else {
    // Adaptive icon için tam kare
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  // Güneş
  const sunX = centerX + baseSize * 0.15;
  const sunY = centerY - baseSize * 0.1;
  const sunRadius = baseSize * 0.22;

  // Güneş ışınları (glow efekti)
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius * 1.4, 0, Math.PI * 2);
  const sunGlow = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.5, sunX, sunY, sunRadius * 1.4);
  sunGlow.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
  sunGlow.addColorStop(0.5, 'rgba(255, 165, 0, 0.3)');
  sunGlow.addColorStop(1, 'rgba(255, 165, 0, 0)');
  ctx.fillStyle = sunGlow;
  ctx.fill();

  // Ana güneş
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
  const sunGradient = ctx.createRadialGradient(sunX - sunRadius * 0.3, sunY - sunRadius * 0.3, 0, sunX, sunY, sunRadius);
  sunGradient.addColorStop(0, '#FFEB3B');
  sunGradient.addColorStop(1, colors.sun);
  ctx.fillStyle = sunGradient;
  ctx.fill();

  // Bulut
  const cloudX = centerX - baseSize * 0.05;
  const cloudY = centerY + baseSize * 0.1;
  const cloudScale = baseSize * 0.012;

  // Bulut gölgesi
  ctx.save();
  ctx.translate(cloudX + 4, cloudY + 4);
  ctx.scale(cloudScale, cloudScale);
  drawCloudPath(ctx);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fill();
  ctx.restore();

  // Ana bulut
  ctx.save();
  ctx.translate(cloudX, cloudY);
  ctx.scale(cloudScale, cloudScale);
  drawCloudPath(ctx);
  const cloudGradient = ctx.createLinearGradient(0, -20, 0, 20);
  cloudGradient.addColorStop(0, '#FFFFFF');
  cloudGradient.addColorStop(1, '#F0F0F0');
  ctx.fillStyle = cloudGradient;
  ctx.fill();
  ctx.restore();
}

function drawCloudPath(ctx) {
  ctx.beginPath();
  ctx.moveTo(-25, 10);
  ctx.bezierCurveTo(-35, 10, -35, -5, -25, -5);
  ctx.bezierCurveTo(-25, -20, -10, -25, 0, -20);
  ctx.bezierCurveTo(5, -30, 25, -30, 30, -15);
  ctx.bezierCurveTo(45, -15, 45, 10, 30, 10);
  ctx.closePath();
}

function drawSplashIcon(ctx, size) {
  const centerX = size / 2;
  const centerY = size / 2;

  // Şeffaf arka plan (splash için)
  ctx.clearRect(0, 0, size, size);

  // Daha büyük güneş ve bulut
  const scale = size * 0.008;
  
  // Güneş
  const sunX = centerX + size * 0.12;
  const sunY = centerY - size * 0.12;
  const sunRadius = size * 0.25;

  // Güneş glow
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius * 1.3, 0, Math.PI * 2);
  const sunGlow = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.5, sunX, sunY, sunRadius * 1.3);
  sunGlow.addColorStop(0, 'rgba(255, 215, 0, 0.9)');
  sunGlow.addColorStop(0.6, 'rgba(255, 165, 0, 0.4)');
  sunGlow.addColorStop(1, 'rgba(255, 165, 0, 0)');
  ctx.fillStyle = sunGlow;
  ctx.fill();

  // Ana güneş
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
  const sunGradient = ctx.createRadialGradient(sunX - sunRadius * 0.3, sunY - sunRadius * 0.3, 0, sunX, sunY, sunRadius);
  sunGradient.addColorStop(0, '#FFEB3B');
  sunGradient.addColorStop(1, '#FFD700');
  ctx.fillStyle = sunGradient;
  ctx.fill();

  // Bulut
  const cloudX = centerX - size * 0.05;
  const cloudY = centerY + size * 0.08;

  ctx.save();
  ctx.translate(cloudX, cloudY);
  ctx.scale(scale, scale);
  drawCloudPath(ctx);
  const cloudGradient = ctx.createLinearGradient(0, -30, 0, 30);
  cloudGradient.addColorStop(0, '#FFFFFF');
  cloudGradient.addColorStop(1, '#F5F5F5');
  ctx.fillStyle = cloudGradient;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 5;
  ctx.fill();
  ctx.restore();
}

function generateIcons() {
  const assetsDir = path.join(__dirname, '..', 'assets');

  // Icon boyutları
  const icons = [
    { name: 'icon.png', size: 1024, isAdaptive: false, isSplash: false },
    { name: 'adaptive-icon.png', size: 1024, isAdaptive: true, isSplash: false },
    { name: 'favicon.png', size: 64, isAdaptive: false, isSplash: false },
    { name: 'splash-icon.png', size: 288, isAdaptive: false, isSplash: true },
  ];

  icons.forEach(({ name, size, isAdaptive, isSplash }) => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    if (isSplash) {
      drawSplashIcon(ctx, size);
    } else {
      drawWeatherIcon(ctx, size, isAdaptive);
    }

    const buffer = canvas.toBuffer('image/png');
    const filePath = path.join(assetsDir, name);
    fs.writeFileSync(filePath, buffer);
    console.log(`✓ Generated: ${name} (${size}x${size})`);
  });

  console.log('\n🎉 All icons generated successfully!');
  console.log('📁 Location:', assetsDir);
}

// Script'i çalıştır
generateIcons();
