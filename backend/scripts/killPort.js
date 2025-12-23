#!/usr/bin/env node

/**
 * Helper script to kill processes using a specific port
 * Usage: node scripts/killPort.js [port]
 */

const port = process.argv[2] || 5000;
const { execSync } = require('child_process');

try {
  console.log(`Checking for processes on port ${port}...`);
  const pids = execSync(`lsof -ti:${port}`, { encoding: 'utf-8' }).trim();
  
  if (pids) {
    const pidList = pids.split('\n').filter(Boolean);
    console.log(`Found ${pidList.length} process(es) using port ${port}: ${pidList.join(', ')}`);
    
    pidList.forEach(pid => {
      try {
        execSync(`kill -9 ${pid}`, { stdio: 'inherit' });
        console.log(`✅ Killed process ${pid}`);
      } catch (err) {
        console.error(`❌ Failed to kill process ${pid}:`, err.message);
      }
    });
    
    console.log(`\n✅ Port ${port} is now free!`);
  } else {
    console.log(`✅ Port ${port} is already free.`);
  }
} catch (err) {
  if (err.status === 1) {
    console.log(`✅ Port ${port} is already free.`);
  } else {
    console.error(`❌ Error:`, err.message);
    process.exit(1);
  }
}

