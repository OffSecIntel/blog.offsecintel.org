/**
 * Pure Vanilla TypeScript AST Node definitions for Markdown Engine.
 * Designed for zero overhead, high performance, and strict typing.
 */

export type ASTNodeType = 
  | 'heading'
  | 'paragraph'
  | 'list'
  | 'code'
  | 'table'
  | 'image'
  | 'blockquote'
  | 'container';

export interface BaseASTNode {
  type: ASTNodeType;
  id: string;
}

export interface HeadingNode extends BaseASTNode {
  type: 'heading';
  level: number;
  text: string;
  slug: string;
}

export interface ParagraphNode extends BaseASTNode {
  type: 'paragraph';
  text: string;
}

export interface ListItem {
  text: string;
  ordered: boolean;
}

export interface ListNode extends BaseASTNode {
  type: 'list';
  ordered: boolean;
  items: ListItem[];
}

export interface CodeNode extends BaseASTNode {
  type: 'code';
  language: string;
  code: string;
}

export interface TableNode extends BaseASTNode {
  type: 'table';
  headers: string[];
  rows: string[][];
}

export interface ImageNode extends BaseASTNode {
  type: 'image';
  alt: string;
  src: string;
}

export interface BlockquoteNode extends BaseASTNode {
  type: 'blockquote';
  text: string;
}

export interface ContainerNode extends BaseASTNode {
  type: 'container';
  color: string;
  content: ASTNode[];
}

export type ASTNode = 
  | HeadingNode
  | ParagraphNode
  | ListNode
  | CodeNode
  | TableNode
  | ImageNode
  | BlockquoteNode
  | ContainerNode;
