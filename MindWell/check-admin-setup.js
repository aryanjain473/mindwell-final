#!/usr/bin/env node
/**
 * Admin Page Setup Verification Script
 * Checks if admin page components and routes are properly configured
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const checks = [];
let passed = 0;
let failed = 0;

function check(name, condition, message) {
  checks.push({ name, condition, message });
  if (condition) {
    console.log(`✅ ${name}: ${message}`);
    passed++;
  } else {
    console.log(`❌ ${name}: ${message}`);
    failed++;
  }
}

console.log('🔍 Checking Admin Page Setup...\n');

// Check frontend components
const adminDashboardPath = path.join(__dirname, 'src', 'pages', 'AdminDashboard.tsx');
const adminRoutePath = path.join(__dirname, 'src', 'components', 'AdminRoute.tsx');
const appPath = path.join(__dirname, 'src', 'App.tsx');

check(
  'AdminDashboard.tsx exists',
  fs.existsSync(adminDashboardPath),
  adminDashboardPath
);

check(
  'AdminRoute.tsx exists',
  fs.existsSync(adminRoutePath),
  adminRoutePath
);

if (fs.existsSync(appPath)) {
  const appContent = fs.readFileSync(appPath, 'utf8');
  check(
    'Admin route configured in App.tsx',
    appContent.includes('/admin') && appContent.includes('AdminDashboard'),
    'Admin route found in App.tsx'
  );
  check(
    'AdminRoute component imported',
    appContent.includes('AdminRoute'),
    'AdminRoute import found'
  );
}

// Check backend routes
const adminRoutesPath = path.join(__dirname, 'server', 'routes', 'admin.js');
const authMiddlewarePath = path.join(__dirname, 'server', 'middleware', 'auth.js');
const serverIndexPath = path.join(__dirname, 'server', 'index.js');

check(
  'Admin routes file exists',
  fs.existsSync(adminRoutesPath),
  adminRoutesPath
);

check(
  'Auth middleware exists',
  fs.existsSync(authMiddlewarePath),
  authMiddlewarePath
);

if (fs.existsSync(adminRoutesPath)) {
  const adminRoutesContent = fs.readFileSync(adminRoutesPath, 'utf8');
  check(
    'Admin dashboard endpoint exists',
    adminRoutesContent.includes('/dashboard'),
    'GET /api/admin/dashboard endpoint found'
  );
  check(
    'Admin users endpoint exists',
    adminRoutesContent.includes('/users'),
    'GET /api/admin/users endpoint found'
  );
  check(
    'Admin middleware applied',
    adminRoutesContent.includes('adminMiddleware'),
    'adminMiddleware is used'
  );
}

if (fs.existsSync(serverIndexPath)) {
  const serverContent = fs.readFileSync(serverIndexPath, 'utf8');
  check(
    'Admin routes registered in server',
    serverContent.includes('/api/admin') && serverContent.includes('adminRoutes'),
    'Admin routes registered in server/index.js'
  );
}

// Check admin creation script
const createAdminPath = path.join(__dirname, 'server', 'scripts', 'createAdmin.js');
check(
  'Admin creation script exists',
  fs.existsSync(createAdminPath),
  createAdminPath
);

// Check documentation
const adminAccessGuidePath = path.join(__dirname, 'ADMIN_ACCESS_GUIDE.md');
check(
  'Admin access guide exists',
  fs.existsSync(adminAccessGuidePath),
  adminAccessGuidePath
);

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Summary:');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📝 Total: ${checks.length}`);

if (failed === 0) {
  console.log('\n🎉 All checks passed! Admin page setup looks good.');
  console.log('\nNext steps:');
  console.log('1. Make sure backend is running: npm run server');
  console.log('2. Make sure frontend is running: npm run client');
  console.log('3. Create admin user: node server/scripts/createAdmin.js');
  console.log('4. Login and access: http://localhost:5173/admin');
} else {
  console.log('\n⚠️  Some checks failed. Please review the errors above.');
  process.exit(1);
}

