import React, { useState } from 'react';
import { Consultant, ServiceNote } from '../types';
import { v4 as uuidv4 } from 'uuid';
import Button from './common/Button';

interface ConsultantsManagerProps {
    consultants: Consultant[];
    setConsultants: (consultants: Consultant[]) => void;
    notes: ServiceNote[];
}

const ConsultantsManager: React.FC<ConsultantsManagerProps> = ({ consultants, setConsultants, notes }) => {
    const [newConsultantName, setNewConsultantName] = useState('');
    
    const handleAddConsultant = (e: React.FormEvent) => {
        e.preventDefault();
        if (newConsultantName.trim() === '') return;
        
        const newConsultant: Consultant = {
            id: uuidv4(),
            name: newConsultantName.trim(),
        };
        setConsultants([...consultants, newConsultant]);
        setNewConsultantName('');
    };

    const handleDeleteConsultant = (consultantId: string) => {
        const notesWithConsultant = notes.filter(n => n.consultantId === consultantId).length;
        if (notesWithConsultant > 0) {
            alert(`No se puede eliminar este asesor porque está asignado a ${notesWithConsultant} nota(s) de servicio.`);
            return;
        }
        if (window.confirm("¿Está seguro de que desea eliminar este asesor?")) {
            setConsultants(consultants.filter(c => c.id !== consultantId));
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-slate-800 mb-6 border-b pb-4">Gestionar Asesores</h1>
                
                <form onSubmit={handleAddConsultant} className="mb-8 flex items-end space-x-3">
                    <div className="flex-grow">
                        <label htmlFor="newConsultantName" className="block text-sm font-medium text-slate-700">Nombre del Asesor</label>
                        <input
                            type="text"
                            id="newConsultantName"
                            value={newConsultantName}
                            onChange={(e) => setNewConsultantName(e.target.value)}
                            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ej: Juan Pérez"
                            required
                        />
                    </div>
                    <Button type="submit">Añadir Asesor</Button>
                </form>

                <div>
                    <h2 className="text-xl font-semibold text-slate-700 mb-4">Lista de Asesores</h2>
                    <ul className="space-y-3">
                        {consultants.length > 0 ? consultants.map(consultant => (
                            <li key={consultant.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
                                <span className="text-slate-800 font-medium">{consultant.name}</span>
                                <Button onClick={() => handleDeleteConsultant(consultant.id)} variant="danger" className="text-sm py-1">
                                    Eliminar
                                </Button>
                            </li>
                        )) : (
                            <p className="text-center text-slate-500 py-8">No hay asesores registrados.</p>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ConsultantsManager;