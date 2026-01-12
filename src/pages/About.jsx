import Card from "../components/Card.jsx";

export default function About() {
  return (
    <div className="space-y-4">
      <Card title="About">
        <div className="text-sm text-slate-300 space-y-3">
          <p>
            This dashboard helps you plan and track training and meals using home workouts (dumbbells + bodyweight)
            and Morocco-friendly food choices.
          </p>
          <p className="text-slate-400 text-sm">
            Everything is saved locally in your browser. No account, no cloud sync by default.
          </p>
        </div>
      </Card>

      <Card title="Offline & data storage">
        <div className="text-sm text-slate-300 space-y-2">
          <div>• Offline: after first load, the app can run offline.</div>
          <div>• Storage: your plan, checklists, and measurements are stored in localStorage.</div>
          <div>• Backup: use the Backup page to export/import JSON.</div>
        </div>
      </Card>

      <Card title="Disclaimer">
        <div className="text-sm text-slate-300 space-y-2">
          <p>
            This app provides general fitness and nutrition guidance. It is not medical advice.
            If you have medical conditions or pain, consult a professional.
          </p>
        </div>
      </Card>
    </div>
  );
}
