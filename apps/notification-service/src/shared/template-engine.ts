import { Injectable } from '@nestjs/common';

@Injectable()
export class TemplateEngine {
  render(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_m, key) => {
      const val = this.getValue(variables, key);
      if (val === null || val === undefined) return '';
      return String(val);
    });
  }

  private getValue(obj: any, path: string) {
    const parts = path.split('.');
    let cur = obj;
    for (const p of parts) {
      if (cur == null) return undefined;
      cur = cur[p];
    }
    return cur;
  }
}
