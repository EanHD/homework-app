/**
 * Enhanced Email Model
 *
 * Provides comprehensive type definitions for email templates,
 * notification preferences, delivery tracking, and email service integration for v1 release
 */

// Email Template Types
export interface EmailTemplate {
  id: string;
  name: string;
  type: EmailTemplateType;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: EmailVariable[];
  metadata: EmailTemplateMetadata;
  createdAt: string;
  updatedAt: string;
}

export type EmailTemplateType =
  | 'welcome'
  | 'password_reset'
  | 'email_confirmation'
  | 'magic_link'
  | 'assignment_due'
  | 'assignment_reminder'
  | 'system_notification'
  | 'weekly_summary'
  | 'account_update'
  | 'oauth_welcome';

export interface EmailVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'url';
  required: boolean;
  defaultValue?: any;
  description: string;
  validation?: EmailVariableValidation;
}

export interface EmailVariableValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: string[];
  format?: 'email' | 'url' | 'date' | 'datetime';
}

export interface EmailTemplateMetadata {
  author: string;
  version: string;
  tags: string[];
  category: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  estimatedReadTime: number; // minutes
  supportedLanguages: string[];
  responsive: boolean;
  darkModeCompatible: boolean;
}

// Email Message Types
export interface EmailMessage {
  id: string;
  templateId: string;
  recipient: EmailRecipient;
  variables: Record<string, any>;
  metadata: EmailMessageMetadata;
  status: EmailStatus;
  delivery: EmailDeliveryInfo;
  createdAt: string;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
}

export interface EmailRecipient {
  email: string;
  name?: string;
  userId?: string;
  preferences: EmailPreferences;
  metadata?: Record<string, any>;
}

export interface EmailPreferences {
  enabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly' | 'never';
  categories: {
    assignments: boolean;
    reminders: boolean;
    system: boolean;
    marketing: boolean;
    security: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
    timezone: string;
  };
  format: 'html' | 'text' | 'both';
}

export interface EmailMessageMetadata {
  campaignId?: string;
  source: string;
  tags: string[];
  priority: 'low' | 'normal' | 'high' | 'critical';
  scheduledFor?: string;
  expiresAt?: string;
  trackingEnabled: boolean;
}

export type EmailStatus =
  | 'draft'
  | 'queued'
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'bounced'
  | 'complained'
  | 'unsubscribed'
  | 'failed';

export interface EmailDeliveryInfo {
  provider: string;
  messageId?: string;
  trackingId?: string;
  attempts: number;
  maxAttempts: number;
  lastAttemptAt?: string;
  nextAttemptAt?: string;
  error?: EmailError;
  ipAddress?: string;
  userAgent?: string;
}

// Email Service Types
export interface EmailService {
  sendEmail(message: EmailMessageRequest): Promise<EmailSendResult>;
  sendBulkEmails(messages: EmailMessageRequest[]): Promise<EmailBulkResult>;
  getEmailStatus(messageId: string): Promise<EmailStatus>;
  cancelEmail(messageId: string): Promise<boolean>;
  resendEmail(messageId: string): Promise<EmailSendResult>;
  validateEmailAddress(email: string): Promise<EmailValidationResult>;
}

export interface EmailMessageRequest {
  templateId: string;
  recipient: EmailRecipient;
  variables: Record<string, any>;
  metadata?: Partial<EmailMessageMetadata>;
  options?: EmailSendOptions;
}

export interface EmailSendOptions {
  priority?: 'low' | 'normal' | 'high' | 'critical';
  scheduledFor?: string;
  trackingEnabled?: boolean;
  testMode?: boolean;
  bypassPreferences?: boolean;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: EmailError;
  deliveryTime?: number; // milliseconds
  providerResponse?: any;
}

export interface EmailBulkResult {
  total: number;
  successful: number;
  failed: number;
  results: EmailSendResult[];
  errors: EmailError[];
}

// Email Validation Types
export interface EmailValidationResult {
  valid: boolean;
  email: string;
  normalized?: string;
  disposable: boolean;
  role: boolean;
  free: boolean;
  score: number; // 0-100 confidence score
  reason?: string;
  suggestions?: string[];
}

// Email Error Types
export interface EmailError {
  code: string;
  message: string;
  type: 'validation' | 'delivery' | 'template' | 'provider' | 'recipient' | 'rate_limit';
  details?: Record<string, any>;
  retryable: boolean;
  timestamp: string;
}

// Email Provider Types
export interface EmailProvider {
  name: string;
  type: 'smtp' | 'api' | 'webhook';
  config: EmailProviderConfig;
  capabilities: EmailProviderCapabilities;
  limits: EmailProviderLimits;
}

export interface EmailProviderConfig {
  apiKey?: string;
  apiSecret?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPassword?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  region?: string;
  domain?: string;
}

export interface EmailProviderCapabilities {
  htmlEmails: boolean;
  textEmails: boolean;
  attachments: boolean;
  tracking: boolean;
  templates: boolean;
  webhooks: boolean;
  bulkSending: boolean;
  scheduling: boolean;
}

export interface EmailProviderLimits {
  maxRecipientsPerEmail: number;
  maxEmailsPerDay: number;
  maxEmailsPerHour: number;
  maxEmailsPerMinute: number;
  maxAttachmentSize: number; // bytes
  rateLimitReset: 'daily' | 'hourly' | 'minutely';
}

// Email Analytics Types
export interface EmailAnalytics {
  overview: EmailOverviewStats;
  templates: EmailTemplateStats[];
  campaigns: EmailCampaignStats[];
  recipients: EmailRecipientStats[];
  timeRange: {
    start: string;
    end: string;
  };
}

export interface EmailOverviewStats {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  totalComplained: number;
  totalUnsubscribed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  complaintRate: number;
  unsubscribeRate: number;
}

export interface EmailTemplateStats {
  templateId: string;
  templateName: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}

export interface EmailCampaignStats {
  campaignId: string;
  campaignName: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  startDate: string;
  endDate?: string;
}

export interface EmailRecipientStats {
  userId?: string;
  email: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  lastActivity: string;
  engagementScore: number; // 0-100
}

// Email Queue Types
export interface EmailQueue {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'stopped';
  priority: number;
  concurrency: number;
  rateLimit: number; // emails per minute
  messages: EmailQueueMessage[];
  stats: EmailQueueStats;
  createdAt: string;
  updatedAt: string;
}

export interface EmailQueueMessage {
  id: string;
  message: EmailMessageRequest;
  priority: number;
  attempts: number;
  maxAttempts: number;
  nextAttemptAt?: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  error?: EmailError;
  createdAt: string;
  processedAt?: string;
}

export interface EmailQueueStats {
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  averageProcessingTime: number;
  throughput: number; // emails per minute
}

// Email Template Engine Types
export interface EmailTemplateEngine {
  render(template: EmailTemplate, variables: Record<string, any>): Promise<EmailRenderedTemplate>;
  validate(template: EmailTemplate): EmailTemplateValidationResult;
  compile(template: EmailTemplate): Promise<CompiledEmailTemplate>;
  getVariables(template: EmailTemplate): EmailVariable[];
}

export interface EmailRenderedTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: Record<string, any>;
  metadata: {
    renderTime: number;
    size: number;
    hasImages: boolean;
    hasLinks: boolean;
  };
}

export interface EmailTemplateValidationResult {
  valid: boolean;
  errors: EmailTemplateValidationError[];
  warnings: EmailTemplateValidationWarning[];
}

export interface EmailTemplateValidationError {
  field: string;
  message: string;
  code: string;
  position?: {
    line: number;
    column: number;
  };
}

export interface EmailTemplateValidationWarning {
  field: string;
  message: string;
  code: string;
}

export interface CompiledEmailTemplate {
  id: string;
  template: EmailTemplate;
  compiledSubject: any;
  compiledHtml: any;
  compiledText?: any;
  variables: EmailVariable[];
  createdAt: string;
}

// Email Notification Types
export interface EmailNotification {
  id: string;
  type: EmailNotificationType;
  recipient: EmailRecipient;
  content: EmailNotificationContent;
  triggers: EmailNotificationTrigger[];
  schedule?: EmailNotificationSchedule;
  status: 'active' | 'paused' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export type EmailNotificationType =
  | 'assignment_due'
  | 'assignment_overdue'
  | 'assignment_reminder'
  | 'weekly_summary'
  | 'monthly_report'
  | 'system_maintenance'
  | 'security_alert'
  | 'account_changes'
  | 'welcome_series';

export interface EmailNotificationContent {
  templateId: string;
  subject: string;
  previewText?: string;
  variables: Record<string, any>;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  contentType: string;
  size: number;
  url?: string;
  data?: Buffer; // Server-side only
}

export interface EmailNotificationTrigger {
  type: 'time_based' | 'event_based' | 'condition_based';
  condition: EmailTriggerCondition;
  delay?: number; // minutes
  priority: 'low' | 'normal' | 'high' | 'critical';
}

export interface EmailTriggerCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value: any;
  and?: EmailTriggerCondition[];
  or?: EmailTriggerCondition[];
}

export interface EmailNotificationSchedule {
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  time?: string; // HH:MM format
  daysOfWeek?: number[]; // 0-6, Sunday = 0
  daysOfMonth?: number[]; // 1-31
  timezone: string;
  startDate?: string;
  endDate?: string;
}

// Default Templates
export const DEFAULT_EMAIL_TEMPLATES: Record<EmailTemplateType, Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>> = {
  welcome: {
    name: 'Welcome Email',
    type: 'welcome',
    subject: 'Welcome to Homework App!',
    htmlContent: `
      <h1>Welcome to Homework App!</h1>
      <p>Hi {{name}},</p>
      <p>Thank you for joining Homework App. We're excited to help you stay organized and on top of your assignments.</p>
      <p>Get started by creating your first assignment!</p>
      <p>Best regards,<br>The Homework App Team</p>
    `,
    variables: [
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'User\'s display name',
      },
    ],
    metadata: {
      author: 'Homework App Team',
      version: '1.0.0',
      tags: ['welcome', 'onboarding'],
      category: 'user',
      priority: 'normal',
      estimatedReadTime: 1,
      supportedLanguages: ['en'],
      responsive: true,
      darkModeCompatible: true,
    },
  },
  password_reset: {
    name: 'Password Reset',
    type: 'password_reset',
    subject: 'Reset your Homework App password',
    htmlContent: `
      <h1>Password Reset</h1>
      <p>Hi {{name}},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <a href="{{resetUrl}}" class="button">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this reset, please ignore this email.</p>
    `,
    variables: [
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'User\'s display name',
      },
      {
        name: 'resetUrl',
        type: 'url',
        required: true,
        description: 'Password reset URL',
      },
    ],
    metadata: {
      author: 'Homework App Team',
      version: '1.0.0',
      tags: ['security', 'password'],
      category: 'security',
      priority: 'high',
      estimatedReadTime: 1,
      supportedLanguages: ['en'],
      responsive: true,
      darkModeCompatible: true,
    },
  },
  email_confirmation: {
    name: 'Email Confirmation',
    type: 'email_confirmation',
    subject: 'Confirm your email address',
    htmlContent: `
      <h1>Confirm Your Email</h1>
      <p>Hi {{name}},</p>
      <p>Please confirm your email address by clicking the button below:</p>
      <a href="{{confirmationUrl}}" class="button">Confirm Email</a>
      <p>This link will expire in 24 hours.</p>
    `,
    variables: [
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'User\'s display name',
      },
      {
        name: 'confirmationUrl',
        type: 'url',
        required: true,
        description: 'Email confirmation URL',
      },
    ],
    metadata: {
      author: 'Homework App Team',
      version: '1.0.0',
      tags: ['verification', 'security'],
      category: 'security',
      priority: 'high',
      estimatedReadTime: 1,
      supportedLanguages: ['en'],
      responsive: true,
      darkModeCompatible: true,
    },
  },
  magic_link: {
    name: 'Magic Link Login',
    type: 'magic_link',
    subject: 'Your login link for Homework App',
    htmlContent: `
      <h1>Sign In to Homework App</h1>
      <p>Hi {{name}},</p>
      <p>Click the button below to sign in to your account:</p>
      <a href="{{loginUrl}}" class="button">Sign In</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this link, please ignore this email.</p>
    `,
    variables: [
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'User\'s display name',
      },
      {
        name: 'loginUrl',
        type: 'url',
        required: true,
        description: 'Magic link login URL',
      },
    ],
    metadata: {
      author: 'Homework App Team',
      version: '1.0.0',
      tags: ['authentication', 'login'],
      category: 'auth',
      priority: 'normal',
      estimatedReadTime: 1,
      supportedLanguages: ['en'],
      responsive: true,
      darkModeCompatible: true,
    },
  },
  assignment_due: {
    name: 'Assignment Due Reminder',
    type: 'assignment_due',
    subject: 'Assignment due soon: {{assignmentTitle}}',
    htmlContent: `
      <h1>Assignment Due Soon</h1>
      <p>Hi {{name}},</p>
      <p>Your assignment "{{assignmentTitle}}" is due {{dueTime}}.</p>
      <p>Course: {{courseName}}</p>
      <p>Due: {{dueDate}}</p>
      <a href="{{assignmentUrl}}" class="button">View Assignment</a>
    `,
    variables: [
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'User\'s display name',
      },
      {
        name: 'assignmentTitle',
        type: 'string',
        required: true,
        description: 'Assignment title',
      },
      {
        name: 'courseName',
        type: 'string',
        required: true,
        description: 'Course name',
      },
      {
        name: 'dueDate',
        type: 'date',
        required: true,
        description: 'Assignment due date',
      },
      {
        name: 'dueTime',
        type: 'string',
        required: true,
        description: 'Time until due (e.g., "tomorrow", "in 2 hours")',
      },
      {
        name: 'assignmentUrl',
        type: 'url',
        required: true,
        description: 'Assignment URL',
      },
    ],
    metadata: {
      author: 'Homework App Team',
      version: '1.0.0',
      tags: ['assignment', 'reminder', 'due'],
      category: 'academic',
      priority: 'high',
      estimatedReadTime: 1,
      supportedLanguages: ['en'],
      responsive: true,
      darkModeCompatible: true,
    },
  },
  assignment_reminder: {
    name: 'Assignment Reminder',
    type: 'assignment_reminder',
    subject: 'Reminder: {{assignmentTitle}}',
    htmlContent: `
      <h1>Assignment Reminder</h1>
      <p>Hi {{name}},</p>
      <p>This is a reminder about your assignment "{{assignmentTitle}}".</p>
      <p>Course: {{courseName}}</p>
      <p>Due: {{dueDate}}</p>
      <a href="{{assignmentUrl}}" class="button">View Assignment</a>
    `,
    variables: [
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'User\'s display name',
      },
      {
        name: 'assignmentTitle',
        type: 'string',
        required: true,
        description: 'Assignment title',
      },
      {
        name: 'courseName',
        type: 'string',
        required: true,
        description: 'Course name',
      },
      {
        name: 'dueDate',
        type: 'date',
        required: true,
        description: 'Assignment due date',
      },
      {
        name: 'assignmentUrl',
        type: 'url',
        required: true,
        description: 'Assignment URL',
      },
    ],
    metadata: {
      author: 'Homework App Team',
      version: '1.0.0',
      tags: ['assignment', 'reminder'],
      category: 'academic',
      priority: 'normal',
      estimatedReadTime: 1,
      supportedLanguages: ['en'],
      responsive: true,
      darkModeCompatible: true,
    },
  },
  system_notification: {
    name: 'System Notification',
    type: 'system_notification',
    subject: '{{subject}}',
    htmlContent: `
      <h1>{{title}}</h1>
      <p>Hi {{name}},</p>
      <p>{{message}}</p>
      {{#if actionUrl}}
      <a href="{{actionUrl}}" class="button">{{actionText}}</a>
      {{/if}}
    `,
    variables: [
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'User\'s display name',
      },
      {
        name: 'subject',
        type: 'string',
        required: true,
        description: 'Email subject',
      },
      {
        name: 'title',
        type: 'string',
        required: true,
        description: 'Notification title',
      },
      {
        name: 'message',
        type: 'string',
        required: true,
        description: 'Notification message',
      },
      {
        name: 'actionUrl',
        type: 'url',
        required: false,
        description: 'Action button URL',
      },
      {
        name: 'actionText',
        type: 'string',
        required: false,
        description: 'Action button text',
      },
    ],
    metadata: {
      author: 'Homework App Team',
      version: '1.0.0',
      tags: ['system', 'notification'],
      category: 'system',
      priority: 'normal',
      estimatedReadTime: 1,
      supportedLanguages: ['en'],
      responsive: true,
      darkModeCompatible: true,
    },
  },
  weekly_summary: {
    name: 'Weekly Summary',
    type: 'weekly_summary',
    subject: 'Your weekly homework summary',
    htmlContent: `
      <h1>Weekly Summary</h1>
      <p>Hi {{name}},</p>
      <p>Here's your homework summary for this week:</p>
      <ul>
        <li>Assignments completed: {{completedCount}}</li>
        <li>Assignments due this week: {{dueThisWeekCount}}</li>
        <li>Assignments overdue: {{overdueCount}}</li>
      </ul>
      {{#if upcomingAssignments}}
      <h2>Upcoming Assignments</h2>
      <ul>
        {{#each upcomingAssignments}}
        <li>{{title}} - Due {{dueDate}}</li>
        {{/each}}
      </ul>
      {{/if}}
      <a href="{{dashboardUrl}}" class="button">View Dashboard</a>
    `,
    variables: [
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'User\'s display name',
      },
      {
        name: 'completedCount',
        type: 'number',
        required: true,
        description: 'Number of completed assignments',
      },
      {
        name: 'dueThisWeekCount',
        type: 'number',
        required: true,
        description: 'Number of assignments due this week',
      },
      {
        name: 'overdueCount',
        type: 'number',
        required: true,
        description: 'Number of overdue assignments',
      },
      {
        name: 'upcomingAssignments',
        type: 'string',
        required: false,
        description: 'List of upcoming assignments',
      },
      {
        name: 'dashboardUrl',
        type: 'url',
        required: true,
        description: 'Dashboard URL',
      },
    ],
    metadata: {
      author: 'Homework App Team',
      version: '1.0.0',
      tags: ['summary', 'weekly', 'report'],
      category: 'academic',
      priority: 'low',
      estimatedReadTime: 2,
      supportedLanguages: ['en'],
      responsive: true,
      darkModeCompatible: true,
    },
  },
  account_update: {
    name: 'Account Update',
    type: 'account_update',
    subject: 'Your account has been updated',
    htmlContent: `
      <h1>Account Updated</h1>
      <p>Hi {{name}},</p>
      <p>Your account has been updated with the following changes:</p>
      <ul>
        {{#each changes}}
        <li>{{field}}: {{oldValue}} → {{newValue}}</li>
        {{/each}}
      </ul>
      <p>If you didn't make these changes, please contact support immediately.</p>
      <a href="{{accountUrl}}" class="button">View Account</a>
    `,
    variables: [
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'User\'s display name',
      },
      {
        name: 'changes',
        type: 'string',
        required: true,
        description: 'List of account changes',
      },
      {
        name: 'accountUrl',
        type: 'url',
        required: true,
        description: 'Account settings URL',
      },
    ],
    metadata: {
      author: 'Homework App Team',
      version: '1.0.0',
      tags: ['account', 'security', 'update'],
      category: 'security',
      priority: 'high',
      estimatedReadTime: 1,
      supportedLanguages: ['en'],
      responsive: true,
      darkModeCompatible: true,
    },
  },
  oauth_welcome: {
    name: 'OAuth Welcome',
    type: 'oauth_welcome',
    subject: 'Welcome to Homework App - Account Connected',
    htmlContent: `
      <h1>Welcome to Homework App!</h1>
      <p>Hi {{name}},</p>
      <p>Thank you for signing in with {{provider}}. Your account has been successfully connected.</p>
      <p>You can now access all features of Homework App using your {{provider}} account.</p>
      <a href="{{dashboardUrl}}" class="button">Get Started</a>
    `,
    variables: [
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'User\'s display name',
      },
      {
        name: 'provider',
        type: 'string',
        required: true,
        description: 'OAuth provider name (Google, Apple, etc.)',
      },
      {
        name: 'dashboardUrl',
        type: 'url',
        required: true,
        description: 'Dashboard URL',
      },
    ],
    metadata: {
      author: 'Homework App Team',
      version: '1.0.0',
      tags: ['welcome', 'oauth', 'social-login'],
      category: 'auth',
      priority: 'normal',
      estimatedReadTime: 1,
      supportedLanguages: ['en'],
      responsive: true,
      darkModeCompatible: true,
    },
  },
};

// Utility Functions
export const isEmailTemplateType = (value: string): value is EmailTemplateType => {
  return Object.keys(DEFAULT_EMAIL_TEMPLATES).includes(value);
};

export const isEmailStatus = (value: string): value is EmailStatus => {
  return ['draft', 'queued', 'sending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed', 'failed'].includes(value);
};

export const isEmailNotificationType = (value: string): value is EmailNotificationType => {
  return ['assignment_due', 'assignment_overdue', 'assignment_reminder', 'weekly_summary', 'monthly_report', 'system_maintenance', 'security_alert', 'account_changes', 'welcome_series'].includes(value);
};

export const createEmailTemplate = (
  type: EmailTemplateType,
  overrides: Partial<EmailTemplate> = {}
): EmailTemplate => {
  const baseTemplate = DEFAULT_EMAIL_TEMPLATES[type];
  return {
    id: `template_${type}_${Date.now()}`,
    ...baseTemplate,
    ...overrides,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const validateEmailVariables = (
  template: EmailTemplate,
  variables: Record<string, any>
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  template.variables.forEach(variable => {
    const value = variables[variable.name];

    if (variable.required && (value === undefined || value === null)) {
      errors.push(`Missing required variable: ${variable.name}`);
      return;
    }

    if (value !== undefined) {
      // Type validation
      switch (variable.type) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`Variable ${variable.name} must be a string`);
          }
          break;
        case 'number':
          if (typeof value !== 'number') {
            errors.push(`Variable ${variable.name} must be a number`);
          }
          break;
        case 'boolean':
          if (typeof value !== 'boolean') {
            errors.push(`Variable ${variable.name} must be a boolean`);
          }
          break;
        case 'date':
          if (!(value instanceof Date) && typeof value !== 'string') {
            errors.push(`Variable ${variable.name} must be a date`);
          }
          break;
        case 'url':
          try {
            new URL(value);
          } catch {
            errors.push(`Variable ${variable.name} must be a valid URL`);
          }
          break;
      }

      // Validation rules
      if (variable.validation) {
        const validation = variable.validation;

        if (validation.minLength && typeof value === 'string' && value.length < validation.minLength) {
          errors.push(`Variable ${variable.name} must be at least ${validation.minLength} characters`);
        }

        if (validation.maxLength && typeof value === 'string' && value.length > validation.maxLength) {
          errors.push(`Variable ${variable.name} must be at most ${validation.maxLength} characters`);
        }

        if (validation.pattern && typeof value === 'string' && !new RegExp(validation.pattern).test(value)) {
          errors.push(`Variable ${variable.name} does not match required pattern`);
        }

        if (validation.enum && !validation.enum.includes(value)) {
          errors.push(`Variable ${variable.name} must be one of: ${validation.enum.join(', ')}`);
        }
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};