import { ASTNode, ListItem } from './types';

/**
 * Pure Vanilla TypeScript Markdown Parser Engine.
 * Conforms to Single Responsibility Principle (SRP) and Abstract Syntax Tree (AST) pattern.
 */
export class MarkdownParser {
  private nodeCounter = 0;

  private generateId(prefix: string): string {
    return `${prefix}-${this.nodeCounter++}`;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  }

  public parse(markdown: string): ASTNode[] {
    if (!markdown) return [];

    const lines = markdown.split('\n');
    const nodes: ASTNode[] = [];

    let currentBlock: 
      | { type: 'code'; language: string; lines: string[] }
      | { type: 'list'; items: ListItem[] }
      | { type: 'paragraph'; lines: string[] }
      | { type: 'table'; rows: string[][] }
      | { type: 'container'; color: string; lines: string[] }
      | null = null;

    const flushCurrentBlock = () => {
      if (!currentBlock) return;

      if (currentBlock.type === 'code') {
        nodes.push({
          type: 'code',
          id: this.generateId('code'),
          language: currentBlock.language,
          code: currentBlock.lines.join('\n')
        });
      } else if (currentBlock.type === 'list') {
        if (currentBlock.items.length > 0) {
          nodes.push({
            type: 'list',
            id: this.generateId('list'),
            ordered: currentBlock.items[0].ordered,
            items: currentBlock.items
          });
        }
      } else if (currentBlock.type === 'paragraph') {
        if (currentBlock.lines.length > 0) {
          const text = currentBlock.lines.join(' ').trim();
          if (text.startsWith('> ')) {
            nodes.push({
              type: 'blockquote',
              id: this.generateId('quote'),
              text: text.substring(2).trim()
            });
          } else if (text.length > 0) {
            nodes.push({
              type: 'paragraph',
              id: this.generateId('para'),
              text
            });
          }
        }
      } else if (currentBlock.type === 'table') {
        if (currentBlock.rows.length > 0) {
          const headers = currentBlock.rows[0];
          const bodyRows = currentBlock.rows.slice(1).filter(r => r.some(c => c.trim() !== '' && !c.includes('---')));
          nodes.push({
            type: 'table',
            id: this.generateId('table'),
            headers,
            rows: bodyRows
          });
        }
      } else if (currentBlock.type === 'container') {
        const subParser = new MarkdownParser();
        const innerNodes = subParser.parse(currentBlock.lines.join('\n'));
        nodes.push({
          type: 'container',
          id: this.generateId('container'),
          color: currentBlock.color,
          content: innerNodes
        });
      }

      currentBlock = null;
    };

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const trimmed = rawLine.trim();

      // 1. Custom Container (::: color ... :::)
      if (trimmed.startsWith(':::')) {
        if (currentBlock && currentBlock.type === 'container') {
          flushCurrentBlock();
        } else {
          flushCurrentBlock();
          const color = trimmed.slice(3).trim() || 'slate';
          currentBlock = { type: 'container', color, lines: [] };
        }
        continue;
      }

      if (currentBlock && currentBlock.type === 'container') {
        currentBlock.lines.push(rawLine);
        continue;
      }

      // 2. Fenced Code Blocks (```lang ... ```)
      if (trimmed.startsWith('```')) {
        if (currentBlock && currentBlock.type === 'code') {
          flushCurrentBlock();
        } else {
          flushCurrentBlock();
          const language = trimmed.slice(3).trim();
          currentBlock = { type: 'code', language, lines: [] };
        }
        continue;
      }

      if (currentBlock && currentBlock.type === 'code') {
        currentBlock.lines.push(rawLine);
        continue;
      }

      // 3. Horizontal Rule
      if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
        flushCurrentBlock();
        continue;
      }

      // 4. Standalone Markdown Images ![alt](url)
      if (trimmed.startsWith('![') && trimmed.endsWith(')')) {
        const match = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (match) {
          flushCurrentBlock();
          nodes.push({
            type: 'image',
            id: this.generateId('img'),
            alt: match[1],
            src: match[2]
          });
          continue;
        }
      }

      // 5. Headings (# H1, ## H2, etc.)
      if (trimmed.startsWith('#')) {
        flushCurrentBlock();
        const level = trimmed.match(/^#+/)?.[0].length || 1;
        const text = trimmed.replace(/^#+\s*/, '');
        const slug = this.slugify(text);
        nodes.push({
          type: 'heading',
          id: `hdr-${slug}`,
          level,
          text,
          slug
        });
        continue;
      }

      // 6. List Items (- item, * item, 1. item)
      const isUnorderedItem = /^[-*]\s+/.test(trimmed);
      const isOrderedItem = /^\d+\.\s+/.test(trimmed);

      if (isUnorderedItem || isOrderedItem) {
        const itemText = isUnorderedItem ? trimmed.replace(/^[-*]\s+/, '') : trimmed.replace(/^\d+\.\s+/, '');
        const itemObj: ListItem = { text: itemText, ordered: isOrderedItem };

        if (currentBlock && currentBlock.type === 'list') {
          currentBlock.items.push(itemObj);
        } else {
          // KEY FIX: Flush open paragraphs or table blocks BEFORE starting a list
          flushCurrentBlock();
          currentBlock = {
            type: 'list',
            items: [itemObj]
          };
        }
        continue;
      }

      // 7. Table Rows (| col1 | col2 |)
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const cells = trimmed.split('|').slice(1, -1);
        if (currentBlock && currentBlock.type === 'table') {
          currentBlock.rows.push(cells);
        } else {
          flushCurrentBlock();
          currentBlock = {
            type: 'table',
            rows: [cells]
          };
        }
        continue;
      }

      // 8. Empty lines -> Flush current block
      if (trimmed === '') {
        flushCurrentBlock();
        continue;
      }

      // 9. Paragraph lines
      if (currentBlock && currentBlock.type === 'paragraph') {
        currentBlock.lines.push(trimmed);
      } else {
        flushCurrentBlock();
        currentBlock = {
          type: 'paragraph',
          lines: [trimmed]
        };
      }
    }

    flushCurrentBlock();
    return nodes;
  }
}
