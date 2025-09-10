// src/components/user/StatsCard.tsx
import React from 'react';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

const StatsCard = ({ icon, label, value }: StatsCardProps) => {
  return (
    <div className="bg-[#201f31] p-4 rounded-lg flex items-center gap-4">
      <div className="flex-shrink-0 text-[#ffbade] bg-gray-700/50 p-3 rounded-full">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-gray-400">{label}</div>
      </div>
    </div>
  );
};

export default StatsCard;