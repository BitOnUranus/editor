import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import DraggableItem from "./DraggableItem";

interface Item {
  id: string;
  content: string;
  group: string;
}

interface PredefPanelProps {
  items: Item[];
  usedItems: Set<string>;
}

const PredefPanel: React.FC<PredefPanelProps> = ({ items, usedItems }) => {
  const { setNodeRef } = useDroppable({
    id: "predefined-panel",
  });

  // Group items by their group property
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, Item[]>);

  return (
    <div
      ref={setNodeRef}
      className="space-y-4 bg-white border border-slate-300 rounded-lg p-3 min-h-[400px] overflow-y-auto transition-all"
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        {Object.entries(groupedItems).map(([groupName, groupItems]) => (
          <div key={groupName}>
            <h3 className="text-md font-semibold text-slate-700 capitalize">
              {groupName} (
              {groupItems.length -
                groupItems.filter((item) => usedItems.has(item.id)).length}
              Unused)
            </h3>
            {groupItems.map((item) => (
              <DraggableItem
                key={item.id}
                id={item.id}
                content={item.content}
                isUsed={usedItems.has(item.id)}
              />
            ))}
          </div>
        ))}
      </SortableContext>
    </div>
  );
};

export default PredefPanel;
