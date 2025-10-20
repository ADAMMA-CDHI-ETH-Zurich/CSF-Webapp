export default function Banner({ tone = "info", title, children, action }) {
    const tones = {
      info:   { bg: "bg-[#f0f6ff]", border: "border-blue-200", icon: "ℹ️" },
      warn:   { bg: "bg-[#FEF2F2]",  border: "border-[#FECACA]"},
    };
    const t = tones[tone] ?? tones.info;
  
    return (
      <div className={`rounded-xl ${t.bg} border ${t.border} p-4 md:p-5 flex items-start gap-3`}>
        <div className="text-lg leading-none select-none">{t.icon}</div>
        <div className="flex-1">
          {title && <h3 className="font-semibold text-[#1e293b]">{title}</h3>}
          <div className="text-sm text-slate-700 mt-1">{children}</div>
        </div>
        {action}
      </div>
    );
  }