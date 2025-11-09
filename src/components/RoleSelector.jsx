import { Briefcase, User } from 'lucide-react';

export default function RoleSelector({ value, onSelect }) {
  const roles = [
    { id: 'jobseeker', label: 'Job Seeker', icon: User, desc: 'Find roles and track applications.' },
    { id: 'company', label: 'Company', icon: Briefcase, desc: 'Post jobs and manage talent.' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
      {roles.map((r) => {
        const Icon = r.icon;
        const active = value === r.id;
        return (
          <button
            key={r.id}
            onClick={() => onSelect(r.id)}
            className={`group relative rounded-xl p-4 text-left transition border ${
              active ? 'bg-white/10 border-white/20 ring-2 ring-cyan-400/50' : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${active ? 'bg-cyan-500 text-slate-950' : 'bg-white/10 text-cyan-300'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium">{r.label}</div>
                <div className="text-sm text-slate-300/80">{r.desc}</div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
