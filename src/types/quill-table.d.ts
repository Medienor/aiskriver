declare module 'quill-table' {
    import Quill from 'quill';
  
    interface TableModule {
      insertTable: (rows: number, columns: number) => void;
      // Add other methods from quill-table if needed
    }
  
    const QuillTable: {
      TableCell: Quill.Attributor;
      TableRow: Quill.Attributor;
      Table: Quill.Attributor;
      tableModule: TableModule;
    };
  
    export default QuillTable;
    export type { TableModule };
  }