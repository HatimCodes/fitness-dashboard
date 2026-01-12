import Sidebar from "./Sidebar.jsx";
import BottomNav from "./BottomNav.jsx";

export default function Layout({ route, setRoute, headerRight, children }) {
  return (
    <div className="min-h-screen md:flex">
      <Sidebar route={route} setRoute={setRoute} />
      <div className="flex-1">
        <div className="sticky top-0 z-30 border-b border-slate-800/70 bg-slate-950/75 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <div className="text-sm font-semibold capitalize">{route}</div>
            <div className="flex items-center gap-2">{headerRight}</div>
          </div>
        </div>
        <main className="mx-auto max-w-6xl px-4 py-4 pb-24 md:pb-6">
          {children}
        </main>
      </div>
      <BottomNav route={route} setRoute={setRoute} />
    </div>
  );
}
