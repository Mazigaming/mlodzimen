import React from 'react';

interface MarkdownEditorToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

export default function MarkdownEditorToolbar({ textareaRef }: MarkdownEditorToolbarProps) {
  const applyMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    let newText;
    if (selectedText) {
      newText = prefix + selectedText + suffix;
    } else {
      newText = prefix + '' + suffix; // Insert markdown without selection
    }

    textarea.value = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
    // Adjust cursor position
    textarea.selectionStart = start + prefix.length;
    textarea.selectionEnd = start + prefix.length + selectedText.length;
    textarea.focus();

    // Manually trigger change event for React to pick up the update
    const event = new Event('input', { bubbles: true });
    textarea.dispatchEvent(event);
  };

  return (
    <div className="flex flex-wrap gap-1 p-1 bg-slate-900 border border-slate-700 rounded-xl mb-2">
      <button
        type="button"
        onClick={() => applyMarkdown('**', '**')}
        className="px-2 py-1 text-xs rounded bg-slate-800 text-gray-400 hover:text-white font-bold"
        title="Bold (Ctrl+B)"
      >
        B
      </button>
      <button
        type="button"
        onClick={() => applyMarkdown('*', '*')}
        className="px-2 py-1 text-xs rounded bg-slate-800 text-gray-400 hover:text-white italic"
        title="Italic (Ctrl+I)"
      >
        I
      </button>
      <button
        type="button"
        onClick={() => applyMarkdown('---', '')}
        className="px-2 py-1 text-xs rounded bg-slate-800 text-gray-400 hover:text-white"
        title="Horizontal Rule"
      >
        HR
      </button>
      <button
        type="button"
        onClick={() => applyMarkdown('- ')}
        className="px-2 py-1 text-xs rounded bg-slate-800 text-gray-400 hover:text-white"
        title="List Item"
      >
        • List
      </button>
      <button
        type="button"
        onClick={() => applyMarkdown('### ')}
        className="px-2 py-1 text-xs rounded bg-slate-800 text-gray-400 hover:text-white"
        title="Heading 3"
      >
        H3
      </button>
    </div>
  );
}

