import React from 'react';
import { User, Building2 } from 'lucide-react';

const roles = [
  { key: 'jobseeker', label: 'Job Seeker', icon: User, desc: 'Find roles and verify your profile.' },
  { key: 'company', label: 'Company', icon: Building2, desc: 'Hire faster with verified resumes.' },
];

const RoleSelector = ({ onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {roles.map((r) => {
        const Icon = r.icon;
        return (
          <button
            key={r.key}
            onClick={() => onSelect(r.key)}
            className="group text-left rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all p-5 focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-sky-500/15 p-2 ring-1 ring-sky-500/30">
                  <Icon className="text-sky-300" size={20} />
                </div>
                <div>
                  <p className="text-white font-medium">{r.label}</p>
                  <p className="text-sm text-slate-300">{r.desc}</p>
                </div>
              </div>
              <span className="text-sky-300/60 group-hover:text-sky-300">→</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default RoleSelector;
