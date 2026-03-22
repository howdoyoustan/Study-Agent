/**
 * How the model should use retrieved chunks from doc_completion (vector RAG).
 */
export const RAG_SYNTHESIS_GUIDANCE = `Answering from retrieved document passages (vector search):

- Ground your answer in the retrieved content: do not claim facts that those passages do not support.
- Synthesize and expand where it helps: connect related snippets, define terms briefly in plain language, and add short bridging sentences so the reply directly and readably answers the question—not a bare list of quotes.
- If retrieval is thin, ambiguous, or off-topic, say so briefly and still stay within what the passages allow.
- Prefer a clear, complete explanation within those limits.`;
