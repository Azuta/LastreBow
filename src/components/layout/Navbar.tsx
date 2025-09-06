// src/components/layout/Navbar.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiUpload } from "react-icons/fi";
import logo from "@/assets/logo.png";
import UserMenu from "./UserMenu"; // <-- 1. Importa el nuevo componente

const Navbar = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Lógica para cerrar el menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuRef]);

  return (
    <nav className="relative top-0 left-0 w-full h-[75px] z-[9999] flex justify-center sm:justify-around items-center bg-graynav shadow-lg text-txnav">
      <div>
        <Link href="/">
          <Image alt="logo" width={56} height={56} src={logo} />
        </Link>
      </div>

      <div className="flex justify-center items-center gap-4">
        {/* Contenedor del menú de usuario */}
        <div ref={userMenuRef} className="relative">
          <span
            className="cursor-pointer hover:text-hovnav"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          >
            Login
          </span>

          {/* 2. Renderiza el menú condicionalmente */}
          {isUserMenuOpen && <UserMenu />}
        </div>

        <button className="transition ease-in-out delay-150 hover:scale-105 duration-300 px-2 sm:px-4 py-2 bg-royal hover:bg-blue-50 hover:shadow-filterblue active:bg-blue-50 rounded-md text-white cursor-pointer flex items-center gap-1">
          <FiUpload size={20} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;