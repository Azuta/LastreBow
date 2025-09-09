// src/components/ui/skeletons/MangaCardSkeleton.tsx
import React from 'react';

export const MangaCardSkeleton = () => {
  return (
    <div className="relative aspect-[2/3] w-full rounded-md overflow-hidden bg-[#2a2c3a] animate-pulse">
      <div className="w-full h-full bg-gray-700/50"></div>
    </div>
  );
};

export const MangaCardListSkeleton = () => {
    return (
        <div className="flex bg-[#201f31] rounded-lg overflow-hidden shadow-lg w-full animate-pulse">
            <div className="flex-shrink-0 w-24 h-36 bg-gray-700/50"></div>
            <div className="p-4 flex flex-col justify-between flex-grow">
                <div>
                    <div className="h-6 w-3/4 bg-gray-700/50 rounded"></div>
                    <div className="h-4 w-1/2 bg-gray-700/50 rounded mt-2"></div>
                    <div className="h-10 w-full bg-gray-700/50 rounded mt-3 hidden md:block"></div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    <div className="h-5 w-16 bg-gray-700/50 rounded-full"></div>
                    <div className="h-5 w-20 bg-gray-700/50 rounded-full"></div>
                </div>
            </div>
        </div>
    )
}