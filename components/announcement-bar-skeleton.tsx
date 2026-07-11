export function AnnouncementBarSkeleton() {
  return (
    <div className="fixed top-0 left-0 w-full h-12 bg-slate-900 animate-pulse z-50">
      <div className="h-full flex items-center px-6">
        <div className="h-4 w-72 rounded bg-slate-700" />
      </div>
    </div>
  );
}