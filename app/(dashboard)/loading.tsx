export default function DashboardLoading() {
  return (
    <div className="flex-1 flex items-center justify-center h-full min-h-[50vh]">
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Spinner */}
        <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
        <p className="text-rose-950 font-medium animate-pulse">Cargando...</p>
      </div>
    </div>
  );
}
