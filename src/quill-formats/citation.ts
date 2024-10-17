import Quill from 'quill';
import { Attributor, Scope } from 'parchment';

const CitationAttributor = new Attributor('citation', 'data-citation', {
  scope: Scope.INLINE
});

Quill.register(CitationAttributor);

console.log('CitationAttributor registered:', CitationAttributor);

export { CitationAttributor };
