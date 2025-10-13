export default function InfoCard({ icon, title, children, footer }) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center gap-3 mb-3">
          {icon}
          <h3 className="text-lg font-semibold text-[#1e293b]">{title}</h3>
        </div>
        <div className="text-sm text-slate-700 leading-6">{children}</div>
        {footer && <div className="mt-4 text-xs text-slate-500">{footer}</div>}
      </div>
    );
  }