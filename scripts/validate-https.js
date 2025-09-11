#!/usr/bin/env node
/**
 * HTTPS Origin Validation Script
 * 
 * Validates that the production environment properly enforces HTTPS
 * and that all Web Push components are properly configured.
 */

const PRODUCTION_URLS = {
  APP: 'https://eanhd.github.io/homework-app/',
  CONFIG: 'https://eanhd.github.io/homework-app/config.json',
  FUNCTIONS: 'https://tihojhmqghihckekvprj.functions.supabase.co',
};

class HTTPSValidator {
  async validateProductionHTTPS() {
    console.log('🔒 Validating HTTPS Configuration\n');

    const results = [];

    // Test 1: Main app HTTPS
    console.log('1. Testing main application HTTPS...');
    try {
      const response = await fetch(PRODUCTION_URLS.APP);
      const isHTTPS = response.url.startsWith('https://');
      const hasSecureHeaders = this.checkSecureHeaders(response);
      
      console.log(`   URL: ${response.url}`);
      console.log(`   HTTPS: ${isHTTPS ? '✅' : '❌'}`);
      console.log(`   Secure Headers: ${hasSecureHeaders ? '✅' : '❌'}`);
      
      results.push({
        test: 'Main App HTTPS',
        passed: isHTTPS,
        url: response.url
      });
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.push({
        test: 'Main App HTTPS',
        passed: false,
        error: error.message
      });
    }
    console.log();

    // Test 2: Config JSON accessibility
    console.log('2. Testing config.json accessibility...');
    try {
      const response = await fetch(PRODUCTION_URLS.CONFIG);
      const config = await response.json();
      const hasVapid = !!(config.vapidPublic && config.vapidPublic.length > 80);
      const hasFunctions = !!(config.functionsBase && config.functionsBase.startsWith('https://'));
      
      console.log(`   Status: ${response.status} ${response.ok ? '✅' : '❌'}`);
      console.log(`   VAPID Key: ${hasVapid ? '✅ Present' : '❌ Missing'}`);
      console.log(`   Functions Base: ${hasFunctions ? '✅ HTTPS' : '❌ Not HTTPS'}`);
      
      results.push({
        test: 'Config JSON',
        passed: response.ok && hasVapid && hasFunctions,
        config: { hasVapid, hasFunctions, functionsBase: config.functionsBase }
      });
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.push({
        test: 'Config JSON',
        passed: false,
        error: error.message
      });
    }
    console.log();

    // Test 3: Functions HTTPS and CORS
    console.log('3. Testing Supabase Functions HTTPS and CORS...');
    try {
      const response = await fetch(`${PRODUCTION_URLS.FUNCTIONS}/subscribe`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://eanhd.github.io',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      });
      
      const allowsOrigin = response.headers.get('access-control-allow-origin') === 'https://eanhd.github.io';
      const allowsMethods = (response.headers.get('access-control-allow-methods') || '').includes('POST');
      
      console.log(`   Status: ${response.status} ${response.status === 204 ? '✅' : '❌'}`);
      console.log(`   CORS Origin: ${allowsOrigin ? '✅ Allowed' : '❌ Not Allowed'}`);
      console.log(`   CORS Methods: ${allowsMethods ? '✅ POST' : '❌ No POST'}`);
      
      results.push({
        test: 'Functions HTTPS/CORS',
        passed: response.status === 204 && allowsOrigin && allowsMethods,
        cors: { allowsOrigin, allowsMethods }
      });
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.push({
        test: 'Functions HTTPS/CORS',
        passed: false,
        error: error.message
      });
    }
    console.log();

    // Test 4: HTTP to HTTPS redirect
    console.log('4. Testing HTTP to HTTPS redirect...');
    try {
      const httpUrl = PRODUCTION_URLS.APP.replace('https://', 'http://');
      const response = await fetch(httpUrl, { redirect: 'manual' });
      const isRedirect = response.status >= 300 && response.status < 400;
      const redirectsToHTTPS = response.headers.get('location')?.startsWith('https://');
      
      console.log(`   HTTP Status: ${response.status} ${isRedirect ? '✅ Redirect' : '❌ No Redirect'}`);
      console.log(`   Redirects to HTTPS: ${redirectsToHTTPS ? '✅' : '❌'}`);
      
      results.push({
        test: 'HTTP Redirect',
        passed: isRedirect && redirectsToHTTPS,
        location: response.headers.get('location')
      });
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.push({
        test: 'HTTP Redirect',
        passed: false,
        error: error.message
      });
    }
    console.log();

    // Summary
    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;
    
    console.log('📋 HTTPS Validation Summary:');
    console.log(`   Passed: ${passedTests}/${totalTests} tests`);
    
    if (passedTests === totalTests) {
      console.log('   ✅ All HTTPS requirements validated successfully!');
      console.log('\n🎯 Production is ready for Web Push notifications');
    } else {
      console.log('   ❌ Some HTTPS requirements failed validation');
      console.log('\n🔧 Issues found:');
      results.filter(r => !r.passed).forEach(r => {
        console.log(`   - ${r.test}: ${r.error || 'Failed validation'}`);
      });
      process.exit(1);
    }

    return results;
  }

  checkSecureHeaders(response) {
    const securityHeaders = [
      'strict-transport-security',
      'x-frame-options',
      'x-content-type-options'
    ];
    
    return securityHeaders.some(header => response.headers.has(header));
  }

  async validateWebPushSupport() {
    console.log('\n🔔 Web Push API Support Check:');
    console.log('   This check requires running in a browser environment');
    console.log('   Use the browser console to run:');
    console.log('   ```');
    console.log('   console.log("Service Worker:", "serviceWorker" in navigator);');
    console.log('   console.log("Notifications:", "Notification" in window);');
    console.log('   console.log("Secure Context:", window.isSecureContext);');
    console.log('   console.log("Push Manager:", "PushManager" in window);');
    console.log('   ```');
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new HTTPSValidator();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'webpush':
      validator.validateWebPushSupport();
      break;
    default:
      validator.validateProductionHTTPS()
        .then(() => validator.validateWebPushSupport())
        .catch(console.error);
  }
}

export default HTTPSValidator;