#!/usr/bin/env node
/**
 * Manual Push Notification Test Script
 * 
 * Usage:
 *   node scripts/test-push.js
 * 
 * Requirements:
 *   - Supabase functions deployed with updated CORS config
 *   - Authentication integration (JWT tokens)
 *   - Valid VAPID keys in environment
 */

import { createClient } from '@supabase/supabase-js';

// Configuration - Load from config.json and environment
const CONFIG = {
  // Function URLs (from public/config.json)
  FUNCTIONS_BASE: process.env.FUNCTIONS_BASE || 'https://tihojhmqghihckekvprj.functions.supabase.co',
  
  // Test notification payload
  TEST_MESSAGE: {
    title: '🧪 Test Notification',
    body: 'This is a test notification from the push system!',
    icon: '/favicon.ico',
    badge: '/icon-192x192.png',
    tag: 'test-notification',
    timestamp: Date.now(),
    data: {
      test: true,
      timestamp: new Date().toISOString(),
      source: 'test-push-script'
    }
  },

  // Test user ID (would come from authentication in real app)
  TEST_USER_ID: process.env.TEST_USER_ID || 'test-user-' + Date.now(),

  // Supabase config (for direct DB access if needed)
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://tihojhmqghihckekvprj.supabase.co',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
};

class PushNotificationTester {
  constructor() {
    this.supabase = null;
    if (CONFIG.SUPABASE_ANON_KEY) {
      this.supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    }
  }

  /**
   * Handle errors with helpful context
   */
  handleError(status, response) {
    if (status === 401) {
      console.log('💡 Authentication required - JWT verification is enabled');
      console.log('   Set SUPABASE_ANON_KEY environment variable');
    } else if (status === 0 || response.toLowerCase().includes('cors')) {
      console.log('💡 CORS issue detected');  
      console.log('   Functions need redeployment with updated CORS config');
    } else if (status >= 500) {
      console.log('💡 Server error - check Supabase function logs');
    }
  }

  /**
   * Test 1: Check if we have valid push subscriptions in the database
   */
  async checkSubscriptions() {
    console.log('🔍 Checking existing push subscriptions...');
    
    if (!this.supabase) {
      console.log('⚠️  Supabase client not configured (missing SUPABASE_ANON_KEY)');
      return [];
    }

    try {
      const { data: subscriptions, error } = await this.supabase
        .from('push_subscriptions')
        .select('*')
        .limit(5);

      if (error) {
        console.error('❌ Database error:', error.message);
        return [];
      }

      console.log(`📊 Found ${subscriptions?.length || 0} subscription(s)`);
      
      if (subscriptions && subscriptions.length > 0) {
        subscriptions.forEach((sub, index) => {
          console.log(`   ${index + 1}. User: ${sub.user_id}`);
          console.log(`      Endpoint: ${sub.endpoint.substring(0, 50)}...`);
          console.log(`      Created: ${new Date(sub.created_at).toLocaleString()}`);
        });
      }

      return subscriptions || [];
    } catch (error) {
      console.error('❌ Error checking subscriptions:', error.message);
      return [];
    }
  }

  /**
   * Test 2: Send a test notification via the schedule function
   */
  async sendTestNotification(userId, subscription = null) {
    console.log(`📨 Sending test notification to user: ${userId}...`);

    const payload = {
      userId: userId,
      title: CONFIG.TEST_MESSAGE.title,
      body: CONFIG.TEST_MESSAGE.body,
      icon: CONFIG.TEST_MESSAGE.icon,
      badge: CONFIG.TEST_MESSAGE.badge,
      tag: CONFIG.TEST_MESSAGE.tag,
      data: CONFIG.TEST_MESSAGE.data,
      scheduledFor: new Date().toISOString(), // Send immediately
    };

    try {
      // Use Supabase client for authenticated function calls
      if (this.supabase) {
        const { data, error } = await this.supabase.functions.invoke('schedule', {
          body: payload
        });
        
        if (error) {
          console.error(`❌ Schedule failed: ${error.message}`);
          this.handleError(400, error.message);
          return false;
        }
        
        console.log('✅ Notification scheduled via Supabase client!');
        console.log(`   Response: ${JSON.stringify(data)}`);
        return true;
      }
      
      // Authentication required - fail hard instead of falling back
      console.error('❌ SUPABASE_ANON_KEY required for authenticated function calls');
      console.error('   Set SUPABASE_ANON_KEY environment variable to enable testing');
      return false;

    } catch (error) {
      console.error('❌ Error in sendTestNotification:', error.message);
      return false;
    }
  }

  /**
   * Test 3: Trigger the send-notifications function (cron simulation)
   */
  async triggerNotificationSend() {
    console.log('⚡ Triggering notification send process...');

    const payload = { 
      trigger: 'manual-test',
      timestamp: new Date().toISOString() 
    };

    try {
      // Use Supabase client for authenticated function calls
      if (this.supabase) {
        const { data, error } = await this.supabase.functions.invoke('send-notifications', {
          body: payload
        });
        
        if (error) {
          console.error(`❌ Trigger failed: ${error.message}`);
          this.handleError(400, error.message);
          return false;
        }
        
        console.log('✅ Notification delivery triggered via Supabase client!');
        console.log(`   Response: ${JSON.stringify(data)}`);
        return true;
      }
      
      // Authentication required - fail hard instead of falling back
      console.error('❌ SUPABASE_ANON_KEY required for authenticated function calls');
      console.error('   Set SUPABASE_ANON_KEY environment variable to enable testing');
      return false;

    } catch (error) {
      console.error('❌ Error in triggerNotificationSend:', error.message);
      return false;
    }
  }

  /**
   * Test 4: Validate VAPID keys and configuration
   */
  async checkConfiguration() {
    console.log('🔧 Checking configuration...');

    // Check function base URL
    console.log(`   Functions Base: ${CONFIG.FUNCTIONS_BASE}`);
    
    // Try to load VAPID key from public config
    try {
      const configResponse = await fetch('http://localhost:5000/config.json');
      if (configResponse.ok) {
        const config = await configResponse.json();
        console.log(`   VAPID Public Key: ${config.vapidPublic ? config.vapidPublic.substring(0, 20) + '...' : 'NOT FOUND'}`);
        console.log(`   Functions Base (config): ${config.functionsBase}`);
      } else {
        console.log('   ⚠️  Could not load public config (dev server not running?)');
      }
    } catch (error) {
      console.log(`   ⚠️  Error loading config: ${error.message}`);
    }

    // Check environment variables
    const envVars = [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY', 
      'FUNCTIONS_BASE',
      'TEST_USER_ID'
    ];

    envVars.forEach(varName => {
      const value = process.env[varName];
      console.log(`   ${varName}: ${value ? '✅ Set' : '❌ Missing'}`);
    });
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Starting Push Notification System Tests\n');
    
    // Validate required configuration for protected function calls
    if (!CONFIG.SUPABASE_ANON_KEY) {
      console.error('❌ Authentication required for push notification testing');
      console.error('   Set SUPABASE_ANON_KEY environment variable to enable function calls');
      console.error('   This is required because all functions now use JWT verification');
      process.exit(1);
    }

    // Test 1: Configuration check
    await this.checkConfiguration();
    console.log();

    // Test 2: Check existing subscriptions  
    const subscriptions = await this.checkSubscriptions();
    console.log();

    // Test 3: Send test notification
    let sendSuccess = false;
    if (subscriptions.length > 0) {
      // Use first subscription's user_id
      const testUserId = subscriptions[0].user_id;
      sendSuccess = await this.sendTestNotification(testUserId, subscriptions[0]);
    } else {
      // Use configured test user ID
      console.log(`📝 No subscriptions found, using test user: ${CONFIG.TEST_USER_ID}`);
      sendSuccess = await this.sendTestNotification(CONFIG.TEST_USER_ID);
    }
    console.log();

    // Test 4: Trigger send process
    const triggerSuccess = await this.triggerNotificationSend();
    console.log();

    // Report overall results
    if (sendSuccess && triggerSuccess) {
      console.log('✅ Test sequence completed successfully!');
      console.log('\n📋 Next Steps:');
      console.log('   1. Check your browser for test notifications');
      console.log('   2. Verify database records were created');
      console.log('   3. Check function logs in Supabase dashboard');
    } else {
      console.log('❌ Test sequence completed with failures');
      console.log('   Check error messages above for details');
      process.exit(1);
    }
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new PushNotificationTester();
  
  const command = process.argv[2];
  
  // Add startup validation for commands that require auth
  if ((command === 'send' || command === 'trigger' || !command) && !CONFIG.SUPABASE_ANON_KEY) {
    console.error('❌ Authentication required for push notification testing');
    console.error('   Set SUPABASE_ANON_KEY environment variable to enable function calls');
    console.error('   This is required because all functions now use JWT verification');
    process.exit(1);
  }
  
  switch (command) {
    case 'subscriptions':
      tester.checkSubscriptions();
      break;
    case 'send':
      const userId = process.argv[3] || CONFIG.TEST_USER_ID;
      tester.sendTestNotification(userId).then(success => {
        if (!success) process.exit(1);
      });
      break;
    case 'trigger':
      tester.triggerNotificationSend().then(success => {
        if (!success) process.exit(1);
      });
      break;
    case 'config':
      tester.checkConfiguration();
      break;
    default:
      tester.runAllTests();
  }
}

export { PushNotificationTester, CONFIG };