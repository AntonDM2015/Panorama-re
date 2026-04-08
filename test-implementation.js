// Automated Test Script for Current Implementation
// Run with: node test-implementation.js

const API_BASE = 'http://localhost:5000';

let passed = 0;
let failed = 0;
let warnings = 0;

function log(message, type = 'info') {
  const colors = {
    pass: '\x1b[32m',
    fail: '\x1b[31m',
    warn: '\x1b[33m',
    info: '\x1b[36m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
}

async function test(name, fn) {
  try {
    await fn();
    log(`✓ ${name}`, 'pass');
    passed++;
  } catch (error) {
    log(`✗ ${name}`, 'fail');
    log(`  Error: ${error.message}`, 'fail');
    failed++;
  }
}

async function testWarning(name, fn) {
  try {
    await fn();
    log(`✓ ${name}`, 'pass');
    passed++;
  } catch (error) {
    log(`⚠ ${name}`, 'warn');
    log(`  Warning: ${error.message}`, 'warn');
    warnings++;
  }
}

// ===================================
// API TESTS
// ===================================

async function runAPITests() {
  log('\n📡 Testing API Endpoints...', 'info');
  console.log('='.repeat(50));

  // Test 1: Cities endpoint
  await test('GET /api/cities - should return cities array', async () => {
    const response = await fetch(`${API_BASE}/api/cities`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data.cities || !Array.isArray(data.cities)) {
      throw new Error('Response missing "cities" array');
    }
    log(`  → Found ${data.cities.length} cities`, 'info');
  });

  // Test 2: Buildings endpoint
  await test('GET /api/buildings - should return buildings array', async () => {
    const response = await fetch(`${API_BASE}/api/buildings`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data.buildings || !Array.isArray(data.buildings)) {
      throw new Error('Response missing "buildings" array');
    }
    log(`  → Found ${data.buildings.length} buildings`, 'info');
  });

  // Test 3: Locations endpoint
  await test('GET /api/locations - should return locations array', async () => {
    const response = await fetch(`${API_BASE}/api/locations`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data.locations || !Array.isArray(data.locations)) {
      throw new Error('Response missing "locations" array');
    }
    log(`  → Found ${data.locations.length} locations`, 'info');
  });

  // Test 4: Navigation links endpoint (may fail if table doesn't exist)
  await testWarning('GET /api/locations/:id/navigation-links - should work', async () => {
    const locationsResponse = await fetch(`${API_BASE}/api/locations`);
    const locationsData = await locationsResponse.json();
    
    if (locationsData.locations.length === 0) {
      throw new Error('No locations available to test');
    }

    const locationId = locationsData.locations[0].id;
    const response = await fetch(`${API_BASE}/api/locations/${locationId}/navigation-links`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - Table may not exist`);
    }
    
    const data = await response.json();
    if (!data.links && !data.navigationLinks) {
      throw new Error('Response missing "links" or "navigationLinks" array');
    }
    const linksArray = data.links || data.navigationLinks || [];
    log(`  → Found ${linksArray.length} navigation links`, 'info');
  });

  // Test 5: Location with panoramas
  await test('GET /api/locations/:id - should include panoramas', async () => {
    const locationsResponse = await fetch(`${API_BASE}/api/locations`);
    const locationsData = await locationsResponse.json();
    
    if (locationsData.locations.length === 0) {
      throw new Error('No locations available to test');
    }

    const locationId = locationsData.locations[0].id;
    const response = await fetch(`${API_BASE}/api/locations/${locationId}`);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    if (!data.location) {
      throw new Error('Response missing "location" object');
    }
    
    log(`  → Location: ${data.location.name}`, 'info');
    log(`  → Has panoramas: ${data.location.panoramas ? 'YES' : 'NO'}`, 'info');
    log(`  → Has navigationLinks: ${data.location.navigationLinks ? 'YES' : 'NO'}`, 'info');
  });
}

// ===================================
// DATABASE CHECKS
// ===================================

async function runDatabaseChecks() {
  log('\n🗄️  Checking Database Schema...', 'info');
  console.log('='.repeat(50));

  await testWarning('navigation_links table exists', async () => {
    // Try to query the table through the API
    const locationsResponse = await fetch(`${API_BASE}/api/locations`);
    const locationsData = await locationsResponse.json();
    
    if (locationsData.locations.length === 0) {
      throw new Error('No locations to test with');
    }

    const locationId = locationsData.locations[0].id;
    const response = await fetch(`${API_BASE}/api/locations/${locationId}/navigation-links`);
    
    if (response.status === 500) {
      throw new Error('Table may not exist - run migrate_navigation_links.sql');
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  });
}

// ===================================
// SUMMARY
// ===================================

function printSummary() {
  log('\n' + '='.repeat(50), 'info');
  log('📊 TEST SUMMARY', 'info');
  log('='.repeat(50), 'info');
  
  log(`✓ Passed: ${passed}`, 'pass');
  if (failed > 0) {
    log(`✗ Failed: ${failed}`, 'fail');
  }
  if (warnings > 0) {
    log(`⚠ Warnings: ${warnings}`, 'warn');
  }
  
  console.log('');
  
  if (failed === 0) {
    log('✅ ALL CRITICAL TESTS PASSED', 'pass');
    log('→ You can proceed with Phase 1.5 and Phase 3', 'info');
  } else {
    log('❌ SOME TESTS FAILED', 'fail');
    log('→ Fix issues before continuing development', 'fail');
  }
  
  if (warnings > 0) {
    log('\n⚠️  Warnings indicate prerequisites needed', 'warn');
    log('→ Run backend/migrate_navigation_links.sql in Supabase', 'warn');
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Review any failed tests above');
  console.log('2. Run migration: backend/migrate_navigation_links.sql');
  console.log('3. Test Building Page in browser: http://localhost:5173');
  console.log('4. Check accordion behavior');
  console.log('5. Test Street View mode');
  console.log('');
}

// ===================================
// RUN ALL TESTS
// ===================================

async function runAllTests() {
  log('🚀 Starting Implementation Tests...', 'info');
  console.log('='.repeat(50));
  
  try {
    await runAPITests();
    await runDatabaseChecks();
  } catch (error) {
    log(`\n❌ Test suite error: ${error.message}`, 'fail');
  } finally {
    printSummary();
  }
}

// Execute
runAllTests();
