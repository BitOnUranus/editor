import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface DraggableItemProps {
  id: string;
  content: string;
  isUsed: boolean;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ id, content, isUsed }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`
        p-3 rounded-md shadow-sm border transition-all ease-in-out duration-200
        ${isDragging ? 'bg-teal-50 border-teal-200 shadow-md' : 'bg-white hover:bg-slate-50'} 
        ${isUsed ? 'border-blue-300 text-blue-600' : 'border-slate-200'}
      `}
    >
      <div className="flex items-center">
        <div
          {...listeners}
          className={`mr-3 hover:text-slate-600 cursor-grab active:cursor-grabbing ${
            isUsed ? 'text-blue-400' : 'text-slate-400'
          }`}
        >
          <GripVertical size={18} />
        </div>
        <p className="text-sm">{content}</p>
      </div>
    </div>
  );
};

export default DraggableItem;