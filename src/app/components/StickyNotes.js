"use client";
import React, { useState } from 'react';
import { Input, Popconfirm, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { FaStickyNote } from 'react-icons/fa';

export default function StickyNotes({ notes, onAddNote, onUpdateNote, onDeleteNote }) {
  const [newNoteContent, setNewNoteContent] = useState('');

  const handleAddClick = () => {
    if (newNoteContent.trim()) {
      // Note: The color is hardcoded to yellow to match your UI.
      // You can add a color picker back later if you wish.
      onAddNote({ content: newNoteContent, color: 'yellow' });
      setNewNoteContent('');
    }
  };

  return (
    <div className="bg-card border border-border p-6 rounded-lg shadow-sm h-full flex flex-col">
      <h2 className="text-lg font-bold mb-4 text-foreground flex items-center">
        <FaStickyNote className="mr-2" />
        Sticky Notes
      </h2>

      {/* Container for notes with vertical scrolling */}
      <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-3 mb-4">
        {notes && notes.map(note => (
          <div
            key={note.id}
            className="group relative p-3 rounded-md shadow-sm bg-yellow-300/80 flex justify-between items-start"
          >
            <p className="text-sm text-yellow-900 break-words pr-4">
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
                  <DeleteOutlined className="text-yellow-900/60" style={{ fontSize: '12px' }} />
                </button>
              </Popconfirm>
            </div>
          </div>
        ))}
      </div>

      {/* Input area for new notes at the bottom */}
      <div className="mt-auto flex flex-col gap-2">
        <Input.TextArea
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          placeholder="Write your note..."
          autoSize={{ minRows: 2, maxRows: 4 }}
          className="!bg-muted !text-foreground !border-border focus:!border-primary focus:!shadow-none placeholder:!text-muted-foreground"
        />
        <Button
          onClick={handleAddClick}
          type="primary"
          className="!bg-primary hover:!bg-primary/90"
        >
          Add Note
        </Button>
      </div>
    </div>
  );
}