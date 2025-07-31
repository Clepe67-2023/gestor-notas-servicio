
import React from 'react';
import { Consultant } from './types';

// 1. CAMBIA EL NOMBRE DE TU EMPRESA AQUÍ
export const COMPANY_NAME = "Corpopyme Consultores";

// 2. AÑADE O QUITA ASESORES DE ESTA LISTA
export const CONSULTANTS: Consultant[] = [
    { id: "juan-perez", name: "Juan Pérez" },
    { id: "maria-gonzalez", name: "María González" },
    { id: "carlos-rodriguez", name: "Carlos Rodríguez" },
    { id: "ana-martinez", name: "Ana Martínez" },
];

// 3. CAMBIA EL LOGO DE TU EMPRESA AQUÍ
// Opción A: Reemplaza este SVG con el tuyo.
export const COMPANY_LOGO = (
  <svg width="48" height="48" viewBox="0 0 24 24" className="text-blue-600" fill="currentColor">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5zM12 12.5L2 7.5l10-5 10 5-10 5z" opacity="0.6"/>
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z"/>
  </svg>
);

/*
// Opción B: Si tienes una imagen (PNG, JPG), comenta el SVG de arriba y usa esto.
// Sube tu logo a un servicio como imgur.com y pega el enlace aquí.
export const COMPANY_LOGO = (
    <img src="https://i.imgur.com/tu_logo.png" alt="Logo de la Empresa" className="w-12 h-12" />
);
*/