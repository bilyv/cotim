import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

interface FloatingNoteProps {
  onSave?: (content: string, projectId: Id<"projects">) => void;
}

export function FloatingNote({ onSave }: FloatingNoteProps) {
  const [position, setPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
  const [dragging, setDragging] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [selectedProject, setSelectedProject] = useState('' as Id<"projects"> | '');
  const dragOffset = useRef({ x: 0, y: 0 });
  const noteRef = useRef<HTMLDivElement>(null);
  const projects = useQuery(api.projects.list);
  const createNote = useMutation(api.notes.create);

  // Load projects for selection
  const userProjects = projects?.filter(p => p.role === 'owner' || p.permission === 'modify') || [];

  const handleMouseDown = (e: React.MouseEvent) => {
    if (noteRef.current) {
      const rect = noteRef.current.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      setDragging(true);
      e.preventDefault(); // Prevent text selection during drag
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragging && noteRef.current) {
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  const handleClick = () => {
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!noteContent.trim()) {
      alert('Please enter some content for your note');
      return;
    }

    if (!selectedProject) {
      alert('Please select a project to assign this note to');
      return;
    }

    try {
      // Save the note using Convex mutation
      await createNote({
        projectId: selectedProject as unknown as Id<"projects">,
        content: noteContent,
      });

      // Close modal and reset form
      setShowModal(false);
      setNoteContent('');
      setSelectedProject('');
      
      // Call the onSave callback if provided
      if (onSave) {
        onSave(noteContent, selectedProject);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setNoteContent('');
    setSelectedProject('');
  };

  return (
    <>
      {/* Floating Circle */}
      <div
        ref={noteRef}
        className="fixed w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg cursor-move flex items-center justify-center z-50 hover:shadow-xl transition-shadow"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </div>

      {/* Note Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Take a Note</h3>
                <button
                  onClick={handleClose}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your note here..."
                className="w-full h-40 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 resize-none"
              />

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Assign to Project
                </label>
                <select 
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value as unknown as Id<"projects"> | '')}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                >
                  <option value="">Select a project</option>
                  {userProjects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}