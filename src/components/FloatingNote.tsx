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
        className="fixed w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg cursor-move flex items-center justify-center z-50 hover:shadow-xl transition-shadow"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </div>

      {/* Note Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 dark:bg-black/70">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col dark:bg-dark-800">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center dark:border-dark-700">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Take a Note</h3>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors dark:hover:bg-dark-700"
              >
                <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your note here..."
                className="w-full h-32 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Assign to Project
                </label>
                <div className="relative">
                  <select 
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value as unknown as Id<"projects"> | '')}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a project</option>
                    {userProjects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700 dark:text-slate-300">
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end dark:border-dark-700">
              <button
                onClick={handleClose}
                className="px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-700 rounded-lg transition-colors mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}