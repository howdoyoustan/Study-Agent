/**
 * How the model should use retrieved chunks from doc_completion (vector RAG).
 */
export const RAG_SYNTHESIS_GUIDANCE = `Answering from retrieved document passages (vector search):

- Ground every substantive claim in the retrieved content. Do not invent facts.
- Use multiple passages: retrieval may return chunks from several PDFs or distant sections of the same book. When more than one passage is relevant, merge evidence from across them—do not answer from only the single top-ranked snippet if other retrieved passages add necessary context, caveats, or alternative angles.
- Integrate sources: where two passages complement or qualify each other, connect them in one coherent answer. If sources disagree or address different aspects, say so briefly and reflect each fairly within what the text allows.
- Go deeper, not shorter: explain mechanisms, steps, warnings, definitions, and clinical or technical nuance with enough detail to be useful for study, whenever the passages support it. Avoid ultra-compressed summaries that drop important qualifiers.
- Use plain-language bridging between ideas; short definitions where a term first appears.
- If retrieval is thin or off-topic, say so briefly and stay within what the passages allow.`;
