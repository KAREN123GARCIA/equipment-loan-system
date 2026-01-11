import { TemplateEngine } from './template-engine';

describe('TemplateEngine', () => {
  it('replaces variables', () => {
    const e = new TemplateEngine();
    expect(e.render('Hi {{userName}}', { userName: 'Ana' })).toBe('Hi Ana');
  });

  it('missing vars become empty', () => {
    const e = new TemplateEngine();
    expect(e.render('Hi {{missing}}', {})).toBe('Hi ');
  });
});
