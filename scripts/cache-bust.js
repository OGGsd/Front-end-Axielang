#!/usr/bin/env node

/**
 * Cache Busting Script for Axie Studio Frontend
 * 
 * This script updates all cache-busting versions across the application
 * to ensure fresh deployments are not affected by browser/CDN caching.
 * 
 * Usage: node scripts/cache-bust.js
 */

const fs = require('fs');
const path = require('path');

// Generate new cache bust version
const generateCacheBustVersion = () => {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.getTime().toString().slice(-4);
  return `${date}-v${time}`;
};

const newVersion = generateCacheBustVersion();

console.log(`🚀 Updating cache bust version to: ${newVersion}`);

// Files to update
const filesToUpdate = [
  {
    path: 'vercel.json',
    updates: [
      {
        search: /"VITE_CACHE_BUST": "[^"]*"/,
        replace: `"VITE_CACHE_BUST": "${newVersion}"`
      },
      {
        search: /"X-Cache-Bust",\s*"value": "[^"]*"/,
        replace: `"X-Cache-Bust", "value": "${newVersion}"`
      }
    ]
  },
  {
    path: 'public/manifest.json',
    updates: [
      {
        search: /"version": "[^"]*"/,
        replace: `"version": "${newVersion}"`
      }
    ]
  },
  {
    path: 'index.html',
    updates: [
      {
        search: /<meta name="cache-bust" content="[^"]*" \/>/,
        replace: `<meta name="cache-bust" content="${newVersion}" />`
      }
    ]
  }
];

// Update files
filesToUpdate.forEach(({ path: filePath, updates }) => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let updated = false;

  updates.forEach(({ search, replace }) => {
    if (content.match(search)) {
      content = content.replace(search, replace);
      updated = true;
    }
  });

  if (updated) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Updated: ${filePath}`);
  } else {
    console.log(`⚠️  No updates needed: ${filePath}`);
  }
});

// Update backend cache headers
const backendPath = path.join(__dirname, '../../agent-platform/main.py');
if (fs.existsSync(backendPath)) {
  let backendContent = fs.readFileSync(backendPath, 'utf8');
  const cacheHeaderRegex = /response\.headers\["X-Cache-Bust"\] = str\(int\(datetime\.[^)]+\)\)/;
  
  if (backendContent.match(cacheHeaderRegex)) {
    backendContent = backendContent.replace(
      /response\.headers\["X-Cache-Bust"\] = "[^"]*"/,
      `response.headers["X-Cache-Bust"] = "${newVersion}"`
    );
    fs.writeFileSync(backendPath, backendContent);
    console.log(`✅ Updated backend cache headers`);
  }
}

console.log(`\n🎉 Cache busting complete! New version: ${newVersion}`);
console.log(`\n📝 Next steps:`);
console.log(`   1. Commit these changes`);
console.log(`   2. Deploy to Vercel`);
console.log(`   3. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)`);
console.log(`   4. Test the application`);
