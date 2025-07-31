
import React, { useState } from 'react';
import { Project, Client } from '../types';
import { v4 as uuidv4 } from 'uuid';
import Modal from './common/Modal';
import Button from './common/Button';
import { PlusIcon, EditIcon, DeleteIcon } from './Icons';

interface ProjectsManagerProps {
  projects: Project[];
  setProjects: (value: Project[] | ((val: Project[]) => Project[])) => void;
  clients: Client[];
}

const ProjectsManager: React.FC<ProjectsManagerProps> = ({ projects, setProjects, clients }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Project | null>(null);
    const [formData, setFormData] = useState({ name: '', clientId: '' });

    const openModal = (item: Project | null = null) => {
        setCurrentItem(item);
        setFormData(item ? { name: item.name, clientId: item.clientId || '' } : { name: '', clientId: '' });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
        setFormData({ name: '', clientId: '' });
    };

    const handleSave = () => {
        if (!formData.name) {
            alert('El nombre del proyecto es obligatorio.');
            return;
        }

        if (currentItem) {
            setProjects(prevProjects => prevProjects.map(p => p.id === currentItem.id ? { ...p, name: formData.name, clientId: formData.clientId || null } : p));
        } else {
            const newProject: Project = {
                id: uuidv4(),
                name: formData.name,
                clientId: formData.clientId || null,
            };
            setProjects(prevProjects => [...prevProjects, newProject]);
        }
        closeModal();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('¿Está seguro de que desea eliminar este proyecto?')) {
            setProjects(prevProjects => prevProjects.filter(item => item.id !== id));
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-700">Proyectos</h2>
                <Button onClick={() => openModal()} className="py-1 px-3 text-sm">
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Añadir Proyecto
                </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {projects.length > 0 ? (
                    projects.map(item => (
                         <div key={item.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-md">
                            <div>
                                <p className="font-medium text-slate-800">{item.name}</p>
                                <p className="text-xs text-slate-500">
                                    Cliente: {clients.find(c => c.id === item.clientId)?.name || 'Sin cliente asociado'}
                                </p>
                            </div>
                            <div className="space-x-2 flex items-center">
                                <button onClick={() => openModal(item)} className="text-slate-500 hover:text-blue-600"><EditIcon className="w-4 h-4"/></button>
                                <button onClick={() => handleDelete(item.id)} className="text-slate-500 hover:text-red-600"><DeleteIcon className="w-4 h-4"/></button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-slate-500 py-4">No hay proyectos.</p>
                )}
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={`${currentItem ? 'Editar' : 'Añadir'} Proyecto`}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Nombre del Proyecto</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Cliente Asociado (Opcional)</label>
                        <select
                            value={formData.clientId}
                            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Ningún cliente específico</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
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

export default ProjectsManager;