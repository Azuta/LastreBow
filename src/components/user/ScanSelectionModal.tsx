// src/components/user/ScanSelectionModal.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabaseClient';
import Image from 'next/image';

const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18"/><path d="M6 6L18 18"/></svg>;

interface ScanGroup {
    id: string;
    name: string;
    logo_url: string;
    description: string;
}

interface ScanSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (scanId: string | null) => void;
}

const ScanSelectionModal = ({ isOpen, onClose, onSave }: ScanSelectionModalProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [scanGroups, setScanGroups] = useState<ScanGroup[]>([]);
    const [selectedScanId, setSelectedScanId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        if (!isOpen) return;
        const fetchScans = async () => {
            setIsLoading(true);
            const { data, error } = await supabase.from('scan_groups').select('*');
            if (error) {
                console.error("Error fetching scan groups:", error);
                setScanGroups([]);
            } else {
                setScanGroups(data || []);
            }
            setIsLoading(false);
        };
        fetchScans();
    }, [isOpen, supabase]);

    const filteredScans = useMemo(() => {
        if (!searchTerm) return scanGroups;
        return scanGroups.filter(scan =>
            scan.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, scanGroups]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-[#201f31] rounded-lg shadow-lg w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Seleccionar Scan</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon /></button>
                </div>
                
                <input
                    type="text"
                    placeholder="Buscar un scan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffbade] mb-4"
                />

                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {isLoading ? (
                        <p className="text-gray-400 text-center">Cargando scans...</p>
                    ) : (
                        filteredScans.map(scan => (
                            <div
                                key={scan.id}
                                onClick={() => setSelectedScanId(scan.id)}
                                className={`flex items-center gap-4 p-2 rounded-lg cursor-pointer transition-colors ${selectedScanId === scan.id ? 'bg-[#ffbade] text-black' : 'hover:bg-gray-700/50'}`}
                            >
                                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                    <Image src={scan.logo_url} alt={scan.name} fill sizes="40px" />
                                </div>
                                <span className={`font-semibold ${selectedScanId === scan.id ? 'text-black' : 'text-white'}`}>{scan.name}</span>
                            </div>
                        ))
                    )}
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="w-full px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg font-semibold hover:bg-gray-600/80">Cancelar</button>
                    <button type="button" onClick={() => onSave(selectedScanId)} disabled={!selectedScanId} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50">Guardar</button>
                </div>
            </div>
        </div>
    );
};

export default ScanSelectionModal;