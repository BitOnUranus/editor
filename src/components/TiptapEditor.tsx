import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

const TiptapEditor = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Loading content...</p>",
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch("https://example.com");
        const html = await response.text();

        // Optional: sanitize or extract specific content from HTML
        editor?.commands.setContent(html);
      } catch (error) {
        console.error("Failed to fetch content:", error);
        editor?.commands.setContent("<p>Error loading content.</p>");
      }
    };

    fetchContent();
  }, [editor]);

  return <EditorContent editor={editor} />;
};

export default TiptapEditor;
