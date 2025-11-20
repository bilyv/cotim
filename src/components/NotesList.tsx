import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface NotesListProps {
  projectId: Id<"projects">;
}

export function NotesList({ projectId }: NotesListProps) {
  const notes = useQuery(api.notes.listByProject, { projectId });
  const removeNote = useMutation(api.notes.remove);
  const [expandedNotes, setExpandedNotes] = useState<Set<Id<"notes">>>(new Set());

  const toggleNoteExpansion = (noteId: Id<"notes">) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  const handleDeleteNote = async (noteId: Id<"notes">) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await removeNote({ noteId });
      } catch (error) {
        console.error('Error deleting note:', error);
        alert('Failed to delete note. Please try again.');
      }
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (!notes) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 dark:bg-dark-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">No notes yet</h3>
        <p className="text-slate-600 dark:text-slate-400">Add notes to this project using the floating note button</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Project Notes ({notes.length})</h3>
      
      <div className="space-y-3">
        {notes.map((note) => {
          const isExpanded = expandedNotes.has(note._id);
          const isLongContent = note.content.length > 150;
          const shouldTruncate = isLongContent && !isExpanded;
          
          return (
            <div 
              key={note._id} 
              className="bg-slate-50 rounded-lg p-4 border border-slate-200 dark:bg-dark-700 dark:border-dark-600"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDate(note.createdAt)}
                </div>
                <button
                  onClick={() => handleDeleteNote(note._id)}
                  className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
                  aria-label="Delete note"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {shouldTruncate ? truncateContent(note.content) : note.content}
              </div>
              
              {isLongContent && (
                <button
                  onClick={() => toggleNoteExpansion(note._id)}
                  className="mt-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                >
                  {isExpanded ? 'Show Less' : 'Read More'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}