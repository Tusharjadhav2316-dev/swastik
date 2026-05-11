export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#060609] flex flex-col items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="text-[#8080a0] font-mono text-sm tracking-widest uppercase animate-pulse">
          Loading...
        </div>
      </div>
    </div>
  );
}
