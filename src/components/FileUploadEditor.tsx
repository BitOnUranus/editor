import React, { useState, useRef, useEffect } from "react";
import { Upload, Save, Copy, FileText, Info } from "lucide-react";
import Editor from "./Editor";
import PredefPanel from "./PredefPanel";
import { DndContext, DragEndEvent, DragOverlay } from "@dnd-kit/core";
import toast from "react-hot-toast";
import mammoth from "mammoth";
import AccelerometerGauge from "./AccelerometerGauge";
import { encodeContent, saveFile } from "../utils/fileUtils";

import dummyData from "../utils/dummy.json";

const FILE_NAME = "editor-content.b64";

const FileUploadEditor: React.FC = () => {
  const [content, setContent] = useState<string>("");
  const [base64Content, setBase64Content] = useState<string>("");
  const [isContentLoaded, setIsContentLoaded] = useState<boolean>(false);
  const [isFileSaved, setIsFileSaved] = useState<boolean>(true);
  const [usedItems, setUsedItems] = useState<Set<string>>(new Set());
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [usedPreTextCount, setUsedPreTextCount] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const editorRef = useRef<any>(null);

  const transformSection = (
    section: { id: number | string; content: string }[],
    groupName: string
  ) =>
    section.map((item) => ({
      id: `${groupName}-${item.id.toString()}`,
      content: item.content,
      group: groupName,
    }));

  const dynamicData = transformSection(
    dummyData.predefinedItem["Dynamic Data fields"],
    "Dynamic Data fields"
  );
  const claimData = transformSection(
    dummyData.predefinedItem["Insert Claim Data"],
    "Insert Claim Data"
  );
  const enclosures = transformSection(
    dummyData.predefinedItem["Insert Enclosures"],
    "Insert Enclosures"
  );
  const disclaimers = transformSection(
    dummyData.predefinedItem["Disclaimer"],
    "Disclaimer"
  );

  const allItems = [
    ...dynamicData,
    ...claimData,
    ...enclosures,
    ...disclaimers,
  ];

  const predefinedItems = allItems;

  useEffect(() => {
    const loadContentFromURL = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/call_document_api/41"
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const text = await response.text();
        setContent(text);
        setIsContentLoaded(true);
        toast.success("Content loaded from URL");
      } catch (error) {
        console.error("Failed to load content from URL:", error);
        toast.error("Failed to load content from URL");
      }
    };

    loadContentFromURL();
  }, []);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      let processedContent: string;

      if (file.name.toLowerCase().endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        processedContent = result.value;
      } else {
        const allowedTypes = ["text/plain", "text/markdown", "text/html"];
        if (!allowedTypes.includes(file.type)) {
          toast.error("Please upload only text or Word (.docx) files");
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          return;
        }

        const text = await file.text();
        processedContent = text
          .replace(/^\uFEFF/, "")
          .replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, "");
      }

      setContent(processedContent);
      setIsContentLoaded(true);
      setIsFileSaved(false);
      toast.success(`File "${file.name}" loaded successfully`);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Error processing file content");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleEditorChange = (newContent: string) => {
    setContent(newContent);
    setIsFileSaved(false);
  };

  const handleSave = async () => {
    try {
      const encoded = encodeContent(content);
      setBase64Content(encoded);
      await saveFile(FILE_NAME, encoded);
      setIsFileSaved(true);
      toast.success("Content saved successfully");
    } catch (error) {
      console.error("Failed to save content:", error);
      toast.error("Failed to save content");
    }
  };

  const handleCopyBase64 = () => {
    if (!base64Content) {
      toast.error("No content to copy");
      return;
    }

    navigator.clipboard
      .writeText(base64Content)
      .then(() => toast.success("Base64 content copied to clipboard"))
      .catch(() => toast.error("Failed to copy to clipboard"));
  };

  const handleDragStart = (event: DragEndEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || over.id !== "editor") return;

    const draggedItem = predefinedItems.find((item) => item.id === active.id);
    if (!draggedItem) return;

    const wrappedContent = `[${draggedItem.content}]`;

    // ✅ Insert at cursor using the editorRef
    if (editorRef.current?.insertTextAtCursor) {
      editorRef.current.insertTextAtCursor(wrappedContent);
    } else {
      // Fallback: append to end
      const newContent = `${content}${content ? "\n" : ""}${wrappedContent}`;
      setContent(newContent);
    }

    setIsFileSaved(false);
    setUsedItems((prev) => new Set([...prev, draggedItem.id]));
    toast.success("Text added to editor");
    setUsedPreTextCount((prev) => prev + 1);
    const percentageUsed =
      ((usedPreTextCount + 1) / predefinedItems.length) * 100;
    setCurrentValue(Number(percentageUsed.toFixed(2)));

    setActiveDragId(null);
  };

  const handleSaveTemplate = () => {
    // Placeholder for save template logic
    toast.success("Template saved successfully");
  };

  const handleSendForReview = () => {
    // Placeholder for send for review logic
    toast.success("Content sent for review");
  };

  const activeDragItem = activeDragId
    ? predefinedItems.find((item) => item.id === activeDragId)
    : null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all">
      <div className="p-4 bg-slate-100 border-b flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors"
          >
            <Upload size={16} className="mr-2" />
            <span>Upload File</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".txt,.md,.html,.docx"
          />

          <button
            onClick={handleSave}
            className={`flex items-center px-4 py-2 rounded transition-colors ${
              isFileSaved
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-teal-600 text-white hover:bg-teal-500"
            }`}
            disabled={isFileSaved}
          >
            <Save size={16} className="mr-2" />
            <span>Save Content</span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleCopyBase64}
            className="flex items-center px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-500 transition-colors"
            disabled={!base64Content}
          >
            <Copy size={16} className="mr-2" />
            <span>Copy Base64</span>
          </button>

          {isContentLoaded && (
            <div className="flex items-center text-green-600">
              <FileText size={16} className="mr-1" />
              <span className="text-sm">Content loaded</span>
            </div>
          )}
        </div>
      </div>
      <div className="p-1 bg-slate-200 text-xs text-slate-600 flex items-center">
        <Info size={14} className="mr-1 ml-2" />
        <span>
          Drag and drop predefined text into the editor. Content will be saved
          in base64 format.
        </span>
      </div>
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
          {/* Document Editor (Left) */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold mb-3 text-slate-700">
              Document Editor
            </h2>

            <Editor
              ref={editorRef}
              content={content}
              onChange={handleEditorChange}
            />
          </div>

          {/* Right Column: Accelerometer Gauge + Predefined Text Below */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold mb-3 text-slate-700">
                Accelerometer Gauge
              </h2>
              <AccelerometerGauge min={0} max={100} value={currentValue} />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-3 text-slate-700">
                Predefined Text {`(${usedPreTextCount} used)`}
              </h2>
              <PredefPanel items={allItems} usedItems={usedItems} />
            </div>
          </div>
        </div>
        <DragOverlay>
          {activeDragItem && (
            <div className="bg-white p-3 rounded-md shadow-lg border-2 border-teal-400 max-w-md">
              <p className="text-sm text-slate-700">{activeDragItem.content}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <div className="flex justify-start gap-4 px-6 pb-6">
        <button
          onClick={handleSaveTemplate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          Save Template
        </button>

        <button
          onClick={handleSendForReview}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
        >
          Send for Review
        </button>
      </div>
    </div>
  );
};

export default FileUploadEditor;
