import Quill from 'quill';

const History = Quill.import('modules/history') as new (quill: Quill, options?: any) => any;

interface CustomHistoryOptions {
  userOnly: boolean;
}

class CustomHistory extends History {
  private quillInstance: Quill;

  constructor(quill: Quill, options: CustomHistoryOptions) {
    super(quill, options);
    this.quillInstance = quill;
  }

  undo() {
    const oldDelta = this.quillInstance.getContents();
    super.undo();
    const newDelta = this.quillInstance.getContents();
    
    // Check if the undo operation brought back any suggestion text
    const diff = oldDelta.diff(newDelta);
    const hasSuggestion = diff.ops?.some((op: any) => 
      op.attributes && (op.attributes.color === '#999' || op.attributes.italic)
    );

    if (hasSuggestion) {
      // If a suggestion was brought back, redo the undo
      super.redo();
    }
  }
}

export default CustomHistory;
