import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import * as path from 'path';

@Injectable()
export class TemplateService {
  private readonly templatesPath: string;

  constructor() {
    // Path to email-templates directory relative to the compiled dist folder
    // In development: src/../email-templates
    // In production: dist/../email-templates
    const isProduction = process.env.NODE_ENV === 'production';
    const basePath = isProduction ? path.join(__dirname, '..') : path.join(__dirname, '../..');
    this.templatesPath = path.join(basePath, 'email-templates');
  }

  renderTemplate(templateName: string, data: Record<string, unknown>): string {
    try {
      const templatePath = path.join(this.templatesPath, templateName, 'index.hbs');

      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template not found: ${templatePath}`);
      }

      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      const template = handlebars.compile(templateContent);
      const renderedHtml = template(data);

      return renderedHtml;
    } catch (error) {
      console.error(
        `TemplateService -> renderTemplate -> error for template "${templateName}":`,
        error,
      );
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to render template: ${templateName}. ${errorMessage}`);
    }
  }
}
