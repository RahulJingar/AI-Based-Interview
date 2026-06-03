import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#7c3aed',
    primaryTextColor: '#fff',
    primaryBorderColor: '#6d28d9',
    lineColor: '#94a3b8',
    secondaryColor: '#1e293b',
    tertiaryColor: '#0f172a',
    background: '#1e293b',
    mainBkg: '#1e293b',
    nodeBorder: '#6d28d9',
    clusterBkg: '#0f172a',
    titleColor: '#e2e8f0',
    edgeLabelBackground: '#1e293b',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
  },
  flowchart: { curve: 'basis', padding: 20 },
  sequence: { actorMargin: 50 },
});

export default function MermaidChart({ code, id }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !code) return;
    ref.current.innerHTML = '';
    mermaid.render(`mermaid-${id}`, code.trim())
      .then(({ svg }) => {
        if (ref.current) ref.current.innerHTML = svg;
      })
      .catch((err) => {
        console.error('Mermaid error:', err);
        if (ref.current) ref.current.innerHTML = `<p class="text-red-400 text-xs p-2">Diagram load nahi hua</p>`;
      });
  }, [code, id]);

  return (
    <div ref={ref}
      className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 my-3 overflow-x-auto flex justify-center" />
  );
}
