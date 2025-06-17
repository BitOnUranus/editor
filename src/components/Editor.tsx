import { useEffect, useImperativeHandle, forwardRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { useDroppable } from "@dnd-kit/core";
import { Bold, Italic, Underline, List, ListOrdered } from "lucide-react";

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

const Editor = forwardRef(({ content, onChange }: EditorProps, ref) => {
  const { setNodeRef } = useDroppable({ id: "editor" });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: "Type or drag content here..." }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none focus:outline-none min-h-[300px] p-4",
      },
    },
  });

  // Expose insertTextAtCursor to parent
  useImperativeHandle(ref, () => ({
    insertTextAtCursor: (text: string) => {
      if (editor) {
        editor.chain().focus().insertContent(text).run();
      }
    },
  }));

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-200 p-2 flex gap-2 bg-slate-50 rounded-t-lg">
        <ToolbarButton
          editor={editor}
          command="toggleBold"
          icon={<Bold size={18} />}
        />
        <ToolbarButton
          editor={editor}
          command="toggleItalic"
          icon={<Italic size={18} />}
        />
        <ToolbarButton
          editor={editor}
          command="toggleStrike"
          icon={<Underline size={18} />}
        />
        <div className="w-px h-6 bg-slate-300 my-auto mx-1" />
        <ToolbarButton
          editor={editor}
          command="toggleBulletList"
          icon={<List size={18} />}
        />
        <ToolbarButton
          editor={editor}
          command="toggleOrderedList"
          icon={<ListOrdered size={18} />}
        />
      </div>
      <div
        ref={setNodeRef}
        className="border border-slate-300 rounded-b-lg bg-white overflow-auto min-h-[400px] shadow-sm transition-all hover:shadow focus-within:ring-2 focus-within:ring-teal-500 focus-within:ring-opacity-50"
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
});

const ToolbarButton = ({ editor, command, icon }: any) => {
  const isActive = editor.isActive(command.replace("toggle", "").toLowerCase());
  return (
    <button
      onClick={() => editor.chain().focus()[command]().run()}
      className={`p-2 rounded hover:bg-slate-200 transition-colors ${
        isActive ? "bg-slate-200 text-slate-900" : "text-slate-600"
      }`}
    >
      {icon}
    </button>
  );
};

export default Editor;
