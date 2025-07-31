
import React, { useState } from 'react';
import { Client } from '../types';
import { v4 as uuidv4 } from 'uuid';
import Modal from './common/Modal';
import Button from './common/Button';
import { PlusIcon, EditIcon, DeleteIcon } from './Icons';

interface ClientsManagerProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
}

const ClientsManager: React.FC<ClientsManagerProps> = ({ clients, setClients }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Client | null>(null);
    const [formData, setFormData] = useState({ name: '', rut: '' });

    const openModal = (item: Client | null = null) => {
        setCurrentItem(item);
        setFormData(item ? { name: item.name, rut: item.rut } : { name: '', rut: '' });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
        setFormData({ name: '', rut: '' });
    };

    const handleSave = () => {
        if (!formData.name || !formData.rut) {
            alert('El nombre y el RUT son obligatorios.');
            return;
        }

        if (currentItem) {
            setClients(prevClients => prevClients.map(c => c.id === currentItem.id ? { ...c, ...formData } : c));
        } else {
            const newClient: Client = {
                id: uuidv4(),
                name: formData.name,
                rut: formData.rut,
            };
            setClients(prevClients => [...prevClients, newClient]);
        }
        closeModal();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('¿Está seguro de que desea eliminar este cliente? Esto podría afectar a las notas de servicio existentes.')) {
            setClients(prevClients => prevClients.filter(item => item.id !== id));
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-700">Clientes</h2>
                <Button onClick={() => openModal()} className="py-1 px-3 text-sm">
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Añadir Cliente
                </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {clients.length > 0 ? (
                    clients.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-md">
                            <div>
                                <p className="font-medium text-slate-800">{item.name}</p>
                                <p className="text-xs text-slate-500">RUT: {item.rut}</p>
                            </div>
                            <div className="space-x-2 flex items-center">
                                <button onClick={() => openModal(item)} className="text-slate-500 hover:text-blue-600"><EditIcon className="w-4 h-4"/></button>
                                <button onClick={() => handleDelete(item.id)} className="text-slate-500 hover:text-red-600"><DeleteIcon className="w-4 h-4"/></button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-slate-500 py-4">No hay clientes.</p>
                )}
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={`${currentItem ? 'Editar' : 'Añadir'} Cliente`}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Nombre / Razón Social</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">RUT</label>
                        <input
                            type="text"
                            value={formData.rut}
                            onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
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

export default ClientsManager;