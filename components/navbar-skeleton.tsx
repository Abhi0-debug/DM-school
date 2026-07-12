export function NavbarSkeleton() {
  return (
    <div className="fixed top-0 left-0 w-full h-20 bg-white border-b animate-pulse z-50">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
        <div className="h-10 w-48 rounded bg-slate-200" />
        <div className="flex gap-4">
          <div className="h-8 w-16 rounded bg-slate-200" />
          <div className="h-8 w-16 rounded bg-slate-200" />
          <div className="h-8 w-16 rounded bg-slate-200" />
          <div className="h-8 w-16 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}