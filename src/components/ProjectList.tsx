import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { ProjectCard } from "./ProjectCard";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Wrapper component for sortable project cards
function SortableProjectCard({ project }: { project: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={isDragging ? "scale-105 rotate-3 shadow-lg" : ""}
    >
      <ProjectCard project={project} />
    </div>
  );
}

export function ProjectList() {
  const projects = useQuery(api.projects.list);
  const [sortedProjects, setSortedProjects] = useState<any[]>([]);
  const updateProjectOrder = useMutation(api.projects.updateOrder);

  // Initialize sorted projects when data loads
  useState(() => {
    if (projects && projects.length > 0 && sortedProjects.length === 0) {
      setSortedProjects([...projects]);
    }
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedProjects.findIndex((p) => p._id === active.id);
      const newIndex = sortedProjects.findIndex((p) => p._id === over.id);
      
      const newSortedProjects = arrayMove(sortedProjects, oldIndex, newIndex);
      setSortedProjects(newSortedProjects);
      
      // Update order in the backend
      const projectIds = newSortedProjects.map(p => p._id);
      await updateProjectOrder({ projectIds });
    }
  };

  if (projects === undefined) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse dark:bg-dark-800">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-3 dark:bg-slate-700"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2 mb-4 dark:bg-slate-700"></div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-200 rounded-full dark:bg-slate-700"></div>
              <div className="h-3 bg-slate-200 rounded w-20 dark:bg-slate-700"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Update sorted projects when projects change
  if (projects && sortedProjects.length === 0) {
    setSortedProjects([...projects]);
  }

  if (sortedProjects.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 dark:from-blue-900/30 dark:to-purple-900/30">
          <svg className="w-12 h-12 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2 dark:text-slate-200">No projects yet</h3>
        <p className="text-slate-600 dark:text-slate-400">Create your first project to start tracking progress</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedProjects.map(p => p._id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 md:mb-0">
          {sortedProjects.map((project) => (
            <SortableProjectCard key={project._id} project={project} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}