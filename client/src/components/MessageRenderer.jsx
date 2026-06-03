import MermaidChart from './MermaidChart';

// Parse message text into parts: text or mermaid blocks
function parseMessage(text) {
  const parts = [];
  const regex = /```mermaid\n([\s\S]*?)```/g;
  let last = 0;
  let match;
  let idx = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push({ type: 'text', content: text.slice(last, match.index) });
    }
    parts.push({ type: 'mermaid', content: match[1], id: idx++ });
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    parts.push({ type: 'text', content: text.slice(last) });
  }

  return parts;
}

// Format text with basic markdown: **bold**, `code`, newlines
function formatText(text) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Bold
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
    // Inline code
    line = line.replace(/`([^`]+)`/g, '<code class="bg-slate-700 text-violet-300 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>');
    // Bullet points
    if (line.trimStart().startsWith('- ') || line.trimStart().startsWith('• ')) {
      line = `<li class="ml-4 list-disc">${line.replace(/^[\s\-•]+/, '')}</li>`;
    }
    return line;
  }).join('\n');
}

export default function MessageRenderer({ text, msgId }) {
  const parts = parseMessage(text);

  return (
    <div className="space-y-1">
      {parts.map((part, i) => {
        if (part.type === 'mermaid') {
          return <MermaidChart key={i} code={part.content} id={`${msgId}-${part.id}`} />;
        }
        return (
          <div key={i}
            className="text-sm leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: formatText(part.content) }}
          />
        );
      })}
    </div>
  );
}
