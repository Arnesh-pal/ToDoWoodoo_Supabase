"use client";
import React, { useState } from 'react';
import { Button, Input, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { FaStickyNote } from 'react-icons/fa';

export default function StickyNotes({ notes, onAddNote, onUpdateNote, onDeleteNote }) {
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');

  const handleAddClick = () => {
    if (newNoteContent.trim()) {
      onAddNote({ content: newNoteContent, color: 'yellow' }); // Default color
      setNewNoteContent('');
    }
  };

  const handleEditBlur = (note) => {
    onUpdateNote({ ...note, content: editingNoteContent });
    setEditingNoteId(null);
  };

  return (
    <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-bold mb-4 text-foreground flex items-center">
        <FaStickyNote className="mr-2" />
        Sticky Notes
      </h2>

      {/* Input for new notes */}
      <div className="flex gap-2 mb-4">
        <Input.TextArea
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          placeholder="Write a quick note..."
          autoSize={{ minRows: 1, maxRows: 3 }}
          className="!bg-muted !text-foreground !border-border focus:!border-primary focus:!shadow-none placeholder:!text-muted-foreground"
        />
        <Button
          onClick={handleAddClick}
          type="primary"
          className="!bg-primary hover:!bg-primary/90"
        >
          Add
        </Button>
      </div>

      {/* Display existing notes */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {notes && notes.map(note => (
          <div key={note.id} className="bg-yellow-200/20 p-3 rounded-md flex justify-between items-start gap-2">
            {editingNoteId === note.id ? (
              <Input.TextArea
                value={editingNoteContent}
                onChange={(e) => setEditingNoteContent(e.target.value)}
                onBlur={() => handleEditBlur(note)}
                autoSize
                autoFocus
                className="!bg-muted !text-foreground !border-border"
              />
            ) : (
              <p
                className="text-sm text-foreground flex-grow break-words cursor-pointer"
                onClick={() => {
                  setEditingNoteId(note.id);
                  setEditingNoteContent(note.content);
                }}
              >
                {note.content}
              </p>
            )}
            <Popconfirm
              title="Delete this note?"
              onConfirm={() => onDeleteNote(note.id)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                className="flex items-center justify-center !w-6 !h-6 hover:!bg-red-500/10"
              />
            </Popconfirm>
          </div>
        ))}
      </div>
    </div>
  );
}