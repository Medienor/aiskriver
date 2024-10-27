declare module 'quill-better-table' {
    import Quill from 'quill';
  
    interface BetterTableModule {
      insertTable(rows: number, cols: number): void;
    }
  
    export default class QuillBetterTable {
      static keyboardBindings: any;
      constructor(quill: Quill, options: any);
    }
  
    export function register(): void;
  }