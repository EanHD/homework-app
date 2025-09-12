#!/usr/bin/env tsx
/**
 * Push Notification Test Script (TypeScript)
 * 
 * Usage:
 *   npm run test:push
 *   npm run test:push -- subscriptions
 *   npm run test:push -- send <userId>
 *   npm run test:push -- trigger
 *
 * Repo note (009): Functions set verify_jwt: false via inline config,
 * so auth tokens are not required for these tests in this branch.
 */

import { createClient } from '@supabase/supabase-js';

interface TestConfig {
  FUNCTIONS_BASE: string;
  TEST_MESSAGE: {
    title: string;
    body: string;
    icon: string;
    badge: string;
    tag: string;
    timestamp: number;
    data: Record<string, any>;
  };
  TEST_USER_ID: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

interface PushSubscription {
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

// Load configuration
const CONFIG: TestConfig = {
  FUNCTIONS_BASE: process.env.FUNCTIONS_BASE || 'https://tihojhmqghihckekvprj.functions.supabase.co',
  
  TEST_MESSAGE: {
    title: '🧪 Test Notification',
    body: 'TypeScript test notification - system is working!',
    icon: '/favicon.ico',
    badge: '/icon-192x192.png', 
    tag: 'test-notification-ts',
    timestamp: Date.now(),
    data: {
      test: true,
      timestamp: new Date().toISOString(),
      source: 'test-push-script-ts',
      environment: process.env.NODE_ENV || 'development'
    }
  },

  TEST_USER_ID: process.env.TEST_USER_ID || `test-user-${Date.now()}`,
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://tihojhmqghihckekvprj.supabase.co',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
};

class PushTester {
  private supabase: any;

  constructor() {
    this.supabase = CONFIG.SUPABASE_ANON_KEY 
      ? createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY)
      : null;
  }

  async getSubscriptions(): Promise<PushSubscription[]> {
    console.log('🔍 Fetching push subscriptions...');
    
    if (!this.supabase) {
      console.log('⚠️  Supabase client not available');
      return [];
    }

    try {
      const { data, error } = await this.supabase
        .from('push_subscriptions')
        .select('user_id, endpoint, p256dh, auth, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const subscriptions: PushSubscription[] = data || [];
      console.log(`📊 Found ${subscriptions.length} subscription(s)`);
      
      subscriptions.forEach((sub, i) => {
        const endpoint = sub.endpoint.length > 60 
          ? sub.endpoint.substring(0, 60) + '...'
          : sub.endpoint;
        console.log(`   ${i + 1}. ${sub.user_id} | ${endpoint}`);
      });

      return subscriptions;
    } catch (error: any) {
      console.error('❌ Error fetching subscriptions:', error.message);
      return [];
    }
  }

  async scheduleNotification(userId: string): Promise<boolean> {
    console.log(`📨 Scheduling test notification for: ${userId}`);

    const payload = {
      userId,
      title: CONFIG.TEST_MESSAGE.title,
      body: CONFIG.TEST_MESSAGE.body,
      icon: CONFIG.TEST_MESSAGE.icon,
      badge: CONFIG.TEST_MESSAGE.badge,
      tag: CONFIG.TEST_MESSAGE.tag,
      data: CONFIG.TEST_MESSAGE.data,
      scheduledFor: new Date().toISOString(),
    };

    try {
      // Use Supabase client for auth-enabled function calls
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
    } catch (error: any) {
      console.error('❌ Network error:', error.message);
      return false;
    }
  }

  async triggerSend(): Promise<boolean> {
    console.log('⚡ Triggering notification delivery...');

    const payload = { 
      trigger: 'manual-test',
      timestamp: new Date().toISOString() 
    };

    try {
      // Use Supabase client for auth-enabled function calls
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
    } catch (error: any) {
      console.error('❌ Network error:', error.message);
      return false;
    }
  }

  private handleError(status: number, response: string): void {
    if (status === 401) {
      console.log('💡 Authentication required - JWT verification is enabled');
      console.log('   Integrate Supabase Auth and pass Bearer token');
    } else if (status === 0 || response.toLowerCase().includes('cors')) {
      console.log('💡 CORS issue detected');  
      console.log('   Functions need redeployment with updated CORS config');
    } else if (status >= 500) {
      console.log('💡 Server error - check Supabase function logs');
    }
  }

  async validateConfig(): Promise<void> {
    console.log('🔧 Validating configuration...');
    console.log(`   Functions: ${CONFIG.FUNCTIONS_BASE}`);
    console.log(`   Test User: ${CONFIG.TEST_USER_ID}`);
    
    // Environment variables check
    const envChecks = [
      { name: 'SUPABASE_URL', value: process.env.SUPABASE_URL },
      { name: 'SUPABASE_ANON_KEY', value: process.env.SUPABASE_ANON_KEY },
      { name: 'FUNCTIONS_BASE', value: process.env.FUNCTIONS_BASE },
    ];

    envChecks.forEach(({ name, value }) => {
      const status = value ? '✅' : '❌';
      console.log(`   ${name}: ${status} ${value ? 'Set' : 'Missing'}`);
    });

    // Try loading runtime config
    try {
      const response = await fetch('http://localhost:5000/config.json');
      if (response.ok) {
        const config = await response.json();
        console.log(`   VAPID: ${config.vapidPublic ? '✅ Available' : '❌ Missing'}`);
      } else {
        console.log('   VAPID: ⚠️  Config unreachable (dev server down?)');
      }
    } catch {
      console.log('   VAPID: ⚠️  Could not check config');
    }
  }

  async run(command?: string, userId?: string): Promise<void> {
    console.log('🚀 Push Notification Test Suite\n');
    
    // Validate required configuration for protected function calls
    if ((command === 'send' || command === 'trigger' || !command) && !CONFIG.SUPABASE_ANON_KEY) {
      console.error('❌ Authentication required for push notification testing');
      console.error('   Set SUPABASE_ANON_KEY environment variable to enable function calls');
      console.error('   This is required because all functions now use JWT verification');
      process.exit(1);
    }

    switch (command) {
      case 'subscriptions':
        await this.getSubscriptions();
        break;
        
      case 'send':
        const targetUser = userId || CONFIG.TEST_USER_ID;
        const sendResult = await this.scheduleNotification(targetUser);
        if (!sendResult) process.exit(1);
        break;
        
      case 'trigger':
        const triggerResult = await this.triggerSend();
        if (!triggerResult) process.exit(1);
        break;
        
      case 'config':
        await this.validateConfig();
        break;
        
      default:
        // Full test suite
        await this.validateConfig();
        console.log();
        
        const subscriptions = await this.getSubscriptions();
        console.log();
        
        const testUserId = subscriptions.length > 0 
          ? subscriptions[0].user_id 
          : CONFIG.TEST_USER_ID;
          
        const sendSuccess = await this.scheduleNotification(testUserId);
        console.log();
        
        const triggerSuccess = await this.triggerSend();
        console.log();
        
        // Report overall results
        if (sendSuccess && triggerSuccess) {
          console.log('✅ Test suite completed successfully!');
          console.log('\n🎯 What to check:');
          console.log('   1. Browser notifications');
          console.log('   2. Database records');
          console.log('   3. Function logs');
        } else {
          console.log('❌ Test suite completed with failures');
          console.log('   Check error messages above for details');
          process.exit(1);
        }
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new PushTester();
  const [,, command, userId] = process.argv;
  tester.run(command, userId).catch(console.error);
}

export default PushTester;
