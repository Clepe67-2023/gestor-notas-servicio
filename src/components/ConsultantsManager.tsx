
import React, { useState } from 'react';
import { Consultant } from '../types';
import { v4 as uuidv4 } from 'uuid';
import Modal from './common/Modal';
import Button from './common/Button';
import { PlusIcon, EditIcon, DeleteIcon } from './Icons';

interface ConsultantsManagerProps {
  consultants: Consultant[];
  setConsultants: React.Dispatch<React.SetStateAction<Consultant[]>>; // <-- ASÍ ES CORRECTO
}

const ConsultantsManager: React.FC<ConsultantsManagerProps> = ({ consultants, setConsultants }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Consultant | null>(null);
    const [formData, setFormData] = useState({ name: '' });

    const openModal = (item: Consultant | null = null) => {
        setCurrentItem(item);
        setFormData(item ? { name: item.name } : { name: '' });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
        setFormData({ name: '' });
    };

    const handleSave = () => {
        if (!formData.name) {
            alert('El nombre del asesor es obligatorio.');
            return;
        }

        if (currentItem) {
            setConsultants(prevConsultants => prevConsultants.map(c => c.id === currentItem.id ? { ...c, name: formData.name } : c));
        } else {
            const newConsultant: Consultant = {
                id: uuidv4(),
                name: formData.name,
            };
            setConsultants(prevConsultants => [...prevConsultants, newConsultant]);
        }
        closeModal();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('¿Está seguro de que desea eliminar este asesor?')) {
            setConsultants(prevConsultants => prevConsultants.filter(item => item.id !== id));
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-700">Asesores</h2>
                <Button onClick={() => openModal()} className="py-1 px-3 text-sm">
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Añadir Asesor
                </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {consultants.length > 0 ? (
                    consultants.map(item => (
                         <div key={item.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-md">
                            <p className="font-medium text-slate-800">{item.name}</p>
                            <div className="space-x-2 flex items-center">
                                <button onClick={() => openModal(item)} className="text-slate-500 hover:text-blue-600"><EditIcon className="w-4 h-4"/></button>
                                <button onClick={() => handleDelete(item.id)} className="text-slate-500 hover:text-red-600"><DeleteIcon className="w-4 h-4"/></button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-slate-500 py-4">No hay asesores.</p>
                )}
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={`${currentItem ? 'Editar' : 'Añadir'} Asesor`}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Nombre del Asesor</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
                        <Button onClick={handleSave}>Guardar</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ConsultantsManager;