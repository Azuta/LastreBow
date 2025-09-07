import React from 'react';

const ChatBox = () => {
  return (
    <div className="sidebar-component bg-[#201f31] rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold p-4 border-b text-white">Chat Global</h3>
      <div className="p-4 h-64 overflow-y-auto space-y-3 text-sm no-scrollbar text-white">
        <p><span className="font-semibold text-cyan-400">User123:</span> ¡El último cap de One Piece estuvo increíble!</p>
        <p><span className="font-semibold text-amber-400">MangaFan:</span> Totalmente, no me esperaba ese giro.</p>
        <p><span className="font-semibold text-rose-400">Admin:</span> Recuerden no hacer spoilers de capítulos muy recientes.</p>
      </div>
      <div className="p-4 border-t border-gray-700">
        <input 
          type="text" 
          placeholder="Escribe un mensaje..." 
          className="w-full bg-gray-700 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffbade]"
        />
      </div>
    </div>
  );
};

export default ChatBox;