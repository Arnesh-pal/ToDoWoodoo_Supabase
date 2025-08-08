"use client";
import React, { useState } from 'react';
import { Input, Popconfirm } from 'antd';
import { FaTrash } from 'react-icons/fa';

// Define a color palette for the notes
const noteColors = {
  yellow: { bg: 'bg-yellow-200', text: 'text-yellow-800', border: 'border-yellow-300' },
  pink: { bg: 'bg-pink-200', text: 'text-pink-800', border: 'border-pink-300' },
  blue: { bg: 'bg-blue-200', text: 'text-blue-800', border: 'border-blue-300' },
  green: { bg: 'bg-green-200', text: 'text-green-800', border: 'border-green-300' },
};
const colorKeys = Object.keys(noteColors);

export default function StickyNotes({ notes, onAddNote, onUpdateNote, onDeleteNote }) {
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteColor, setNewNoteColor] = useState('yellow');

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return;
    onAddNote({ content: newNoteContent, color: newNoteColor });
    setNewNoteContent('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddNote();
    }
  };

  return (
    <div className="bg-card border border-border p-6 rounded-lg shadow-sm h-full flex flex-col">
      <h2 className="text-lg font-bold mb-4 text-foreground">📌 Sticky Notes</h2>

      {/* Input area for new notes */}
      <div className={`p-3 rounded-md mb-4 border ${noteColors[newNoteColor].border} ${noteColors[newNoteColor].bg}`}>
        <Input.TextArea
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a note and press Enter..."
          autoSize={{ minRows: 2, maxRows: 4 }}
          className="!bg-transparent !text-current !border-0 focus:!shadow-none !p-0 placeholder:!text-current/60"
        />
        <div className="flex justify-between items-center mt-2">
          <div className="flex gap-2">
            {colorKeys.map(color => (
              <button
                key={color}
                onClick={() => setNewNoteColor(color)}
                className={`w-5 h-5 rounded-full ${noteColors[color].bg} border-2 ${newNoteColor === color ? 'border-foreground' : 'border-transparent'}`}
                aria-label={`Select ${color} color`}
              />
            ))}
          </div>
          <button onClick={handleAddNote} className="text-xs font-semibold text-current/80 hover:text-current">Add</button>
        </div>
      </div>

      {/* Grid for displaying existing notes */}
      <div className="flex-grow overflow-y-auto pr-2 -mr-2">
        <div className="grid grid-cols-2 gap-4">
          {notes && notes.map(note => (
            <div
              key={note.id}
              className={`group relative p-4 rounded-md shadow-md h-40 flex flex-col justify-between transition-transform hover:scale-105 hover:z-10 ${noteColors[note.color]?.bg || noteColors.yellow.bg}`}
            >
              <p className={`text-sm break-words flex-grow ${noteColors[note.color]?.text || noteColors.yellow.text}`}>
                {note.content}
              </p>
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Popconfirm
                  title="Delete this note?"
                  onConfirm={() => onDeleteNote(note.id)}
                  okText="Yes"
                  cancelText="No"
                  okButtonProps={{ danger: true }}
                >
                  <button className="p-1 rounded-full hover:bg-black/10">
                    <FaTrash className="w-3 h-3 text-current/60" />
                  </button>
                </Popconfirm>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}