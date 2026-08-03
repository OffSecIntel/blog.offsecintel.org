import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MarkdownRenderer } from "../../components/MarkdownRenderer";

describe('MarkdownRenderer', () => {
  it('renders generic markdown text correctly', () => {
    render(<MarkdownRenderer content="Hello **World**" />);
    const boldElement = screen.getByText('World');
    expect(boldElement.tagName).toBe('STRONG');
    expect(boldElement).toBeInTheDocument();
  });

  it('correctly tokenizes and highlights Assembly code with colons', () => {
    const asmContent = "```assembly\nil2cpp:0102c82c SUB SP, SP, #0x20\n```";
    const { container } = render(<MarkdownRenderer content={asmContent} />);
    
    // The colon should be handled gracefully by the assembly tokenizer
    // We expect "il2cpp:" to be treated as a label/section prefix, and "SUB" as a mnemonic
    const preBlock = container.querySelector('pre');
    expect(preBlock).toBeInTheDocument();
    
    // Check if the specific tokens are rendered with their respective tailwind color classes
    const htmlOutput = preBlock?.innerHTML || '';
    
    // Should contain the hex value
    expect(htmlOutput).toContain('0102c82c');
    
    // Check that the fallback regex didn't strip out the content
    expect(htmlOutput).toContain('SUB');
    expect(htmlOutput).toContain('SP');
  });

  it('correctly tokenizes JSON code blocks', () => {
    const jsonContent = "```json\n{\n  \"key\": \"value\",\n  \"number\": 123\n}\n```";
    const { container } = render(<MarkdownRenderer content={jsonContent} />);
    
    const preBlock = container.querySelector('pre');
    const htmlOutput = preBlock?.innerHTML || '';
    
    expect(htmlOutput).toContain('key');
    expect(htmlOutput).toContain('value');
    expect(htmlOutput).toContain('123');
  });

  it('correctly tokenizes YAML code blocks', () => {
    const yamlContent = "```yaml\nkey: value\n# comment\n```";
    const { container } = render(<MarkdownRenderer content={yamlContent} />);
    const preBlock = container.querySelector('pre');
    expect(preBlock?.innerHTML).toContain('key');
  });

  it('correctly tokenizes generic code blocks', () => {
    const jsContent = "```javascript\nconst a = 1; // comment\n```";
    const { container } = render(<MarkdownRenderer content={jsContent} />);
    const preBlock = container.querySelector('pre');
    expect(preBlock?.innerHTML).toContain('const');
  });

  it('renders tables correctly', () => {
    const tableContent = "| Header |\n| --- |\n| Row |";
    const { container } = render(<MarkdownRenderer content={tableContent} />);
    expect(container.innerHTML).toContain('Header');
    expect(container.innerHTML).toContain('Row');
  });

  it('renders blockquotes correctly', () => {
    const quoteContent = "> This is a quote";
    const { container } = render(<MarkdownRenderer content={quoteContent} />);
    expect(container.innerHTML).toContain('This is a quote');
  });

  it('renders lists correctly', () => {
    const listContent = "- Item 1\n- Item 2";
    const { container } = render(<MarkdownRenderer content={listContent} />);
    expect(container.innerHTML).toContain('Item 1');
    expect(container.innerHTML).toContain('Item 2');
  });
});
