import React from 'react';
import { User, Building2 } from 'lucide-react';

const RoleSelector = ({ role, onSelect }) => {
  const btn = (key, Icon, label) => (
    <button
      key={key}
      onClick={() => onSelect(key)}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${
        role === key ? 'bg-indigo-600 text-white border-indigo-600 shadow' : 'bg-white/80 text-gray-700 border-gray-300 hover:border-gray-400'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium capitalize">{label}</span>
    </button>
  );

  return (
    <div className="grid grid-cols-2 gap-3">
      {btn('jobseeker', User, 'Job Seeker')}
      {btn('company', Building2, 'Company')}
    </div>
  );
};

export default RoleSelector;
