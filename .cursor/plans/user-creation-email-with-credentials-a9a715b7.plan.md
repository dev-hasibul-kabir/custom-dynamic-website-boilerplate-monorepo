<!-- a9a715b7-04e2-4bc6-b740-317c2046ae11 aaf61309-39f4-49af-89d1-baa6fb37d4e0 -->
# User Creation Email with Credentials Implementation

## Overview

Implement email notification for user creation that sends login credentials using Handlebars templates, following the existing email template pattern. Fix linter and formatting issues.

## Implementation Steps

### 1. Create Email Template

- **File**: `apps/api/email-templates/user-creation-credentials/index.hbs`
- Create Handlebars template following the pattern of existing templates (customer-sign-up, customer-forgot-password-init)
- Include placeholders for: `{{userName}}`, `{{userEmail}}`, `{{userPassword}}`
- Use similar styling and structure as existing templates

### 2. Create Template Rendering Utility

- **File**: `apps/api/src/util/template.service.ts` (new file)
- Create a service to read and compile Handlebars templates
- Method: `renderTemplate(templateName: string, data: Record<string, any>): Promise<string>`
- Read template from `email-templates/{templateName}/index.hbs`
- Compile with Handlebars and return rendered HTML
- Add to `utility.module.ts` providers and exports

### 3. Update User Service

- **File**: `apps/api/src/modules/user/user.service.ts`
- Inject `TemplateService` (or add template rendering to MailerService)
- In `save()` method (line 244), replace inline HTML (lines 286-328) with:
- Call template service to render `user-creation-credentials` template
- Pass user data: `{ userName: dto.name, userEmail: dto.email, userPassword: dto.password }`
- Use rendered HTML in `notificationService.sendEmail()` call

### 4. Fix TypeScript Linter Issues

- **File**: `apps/api/src/util/mailer.service.ts`
- Fix `IMailerPayload` interface - ensure it properly extends `nodemailer.SendMailOptions`
- The interface should include all properties: `from`, `to`, `subject`, `text`, `html`, `attachments`
- Verify TypeScript recognizes these properties correctly

- **Files**: `apps/api/src/util/notification.processor.ts`, `apps/api/src/util/notification.service.ts`
- Check and fix any TypeScript compilation errors (missing module declarations)
- Verify all imports are correct and type declarations are available
- Ensure proper formatting and code style compliance

### 5. Fix Formatting Issues

- Run Prettier on all modified files
- Ensure consistent code formatting across:
- `user.service.ts`
- `mailer.service.ts`
- `template.service.ts` (new file)
- Any other modified files

## Files to Modify

1. `apps/api/email-templates/user-creation-credentials/index.hbs` (new)
2. `apps/api/src/util/template.service.ts` (new)
3. `apps/api/src/util/utility.module.ts` (add TemplateService)
4. `apps/api/src/modules/user/user.service.ts` (update save method)
5. `apps/api/src/util/mailer.service.ts` (fix TypeScript issues)

## Notes

- Keep existing notification queue flow (NotificationService → NotificationProcessor → MailerService)
- Template should match the design pattern of existing email templates
- Password should be included in email (as per user requirement)
- Ensure proper error handling for template rendering

### To-dos

- [ ] Create user-creation-credentials Handlebars email template with userName, userEmail, userPassword placeholders
- [ ] Create TemplateService to read and compile Handlebars templates from email-templates directory
- [ ] Add TemplateService to utility.module.ts providers and exports
- [ ] Replace inline HTML in user.service.ts save() method with template rendering call
- [ ] Fix IMailerPayload TypeScript interface issues in mailer.service.ts
- [ ] Run Prettier to fix formatting issues in all modified files