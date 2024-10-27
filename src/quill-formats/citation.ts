import Quill from 'quill';
import { Attributor, Scope } from 'parchment';

const CitationAttributor = new Attributor('citation', 'data-citation', {
  scope: Scope.INLINE
});

const CitationStyleAttributor = new Attributor('citationStyle', 'data-citation-style', {
  scope: Scope.INLINE
});

Quill.register(CitationAttributor);
Quill.register(CitationStyleAttributor);

console.log('CitationAttributor registered:', CitationAttributor);
console.log('CitationStyleAttributor registered:', CitationStyleAttributor);

export { CitationAttributor, CitationStyleAttributor };
