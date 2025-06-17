import { Toaster } from "react-hot-toast";
import FileUploadEditor from "./components/FileUploadEditor";

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-800 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Document Editor</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <FileUploadEditor />
        {/* <TiptapEditor /> */}
      </main>

      <Toaster position="top-right" />
    </div>
  );
}

export default App;
