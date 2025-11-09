export default function Footer() {
  return (
    <footer className="relative z-10 mt-16 border-t border-white/10/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} HireLens — Elevating hiring with clarity.
      </div>
    </footer>
  );
}
