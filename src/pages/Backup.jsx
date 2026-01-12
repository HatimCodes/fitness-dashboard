import { useState } from "react";
import Card from "../components/Card.jsx";
import { exportJSON, importJSON } from "../lib/storage.js";

export default function Backup({ onReload }) {
  const [text, setText] = useState(exportJSON());
  const [msg, setMsg] = useState("");

  function doExport() {
    setText(exportJSON());
    setMsg("Exported current data.");
  }

  function doImport() {
    try {
      importJSON(text);
      setMsg("Imported successfully. Reloading state…");
      onReload();
    } catch (e) {
      setMsg(`Import failed: ${e.message}`);
    }
  }

  return (
    <div className="space-y-4">
      <Card title="Export / Import (JSON backup)">
        <div className="flex gap-2 mb-3">
          <button onClick={doExport} className="px-4 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-sm">Export</button>
          <button onClick={doImport} className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm">Import</button>
          {msg && <div className="text-xs text-slate-400 self-center">{msg}</div>}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-2xl border border-slate-800/70 bg-slate-950/40 px-3 py-3 text-xs outline-none focus:border-indigo-500/60 min-h-[320px]"
        />
        <div className="mt-2 text-xs text-slate-500">
          Keep backups. If you lose your browser storage, this is how you recover.
        </div>
      </Card>
    </div>
  );
}
