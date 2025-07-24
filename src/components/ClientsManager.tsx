import React, { useState } from 'react';
import { Client, Project } from '../types';
import { v4 as uuidv4 } from 'uuid';
import Button from './common/Button';

interface ClientsManagerProps {
    clients: Client[];
    setClients: (clients: Client[]) => void;
    projects: Project[];
}

const ClientsManager: React.FC<ClientsManagerProps> = ({ clients, setClients, projects }) => {
    const [newClientName, setNewClientName] = useState('');
    
    const handleAddClient = (e: React.FormEvent) => {
        e.preventDefault();
        if (newClientName.trim() === '') return;
        
        const newClient: Client = {
            id: uuidv4(),
            name: newClientName.trim(),
        };
        setClients([...clients, newClient]);
        setNewClientName('');
    };

    const handleDeleteClient = (clientId: string) => {
        const projectsWithClient = projects.filter(p => p.clientId === clientId).length;
        if (projectsWithClient > 0) {
            if (!window.confirm(`Este cliente tiene ${projectsWithClient} proyecto(s) asociado(s). Si lo elimina, los proyectos quedarán sin cliente. ¿Está seguro de que desea continuar?`)) {
                return;
            }
        } else {
             if (!window.confirm("¿Está seguro de que desea eliminar este cliente?")) {
                return;
            }
        }
        setClients(clients.filter(c => c.id !== clientId));
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-slate-800 mb-6 border-b pb-4">Gestionar Clientes</h1>
                
                <form onSubmit={handleAddClient} className="mb-8 flex items-end space-x-3">
                    <div className="flex-grow">
                        <label htmlFor="newClientName" className="block text-sm font-medium text-slate-700">Nombre del Cliente</label>
                        <input
                            type="text"
                            id="newClientName"
                            value={newClientName}
                            onChange={(e) => setNewClientName(e.target.value)}
                            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ej: Empresa S.A."
                            required
                        />
                    </div>
                    <Button type="submit">Añadir Cliente</Button>
                </form>

                <div>
                    <h2 className="text-xl font-semibold text-slate-700 mb-4">Lista de Clientes</h2>
                    <ul className="space-y-3">
                        {clients.length > 0 ? clients.map(client => (
                            <li key={client.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
                                <span className="text-slate-800 font-medium">{client.name}</span>
                                <Button onClick={() => handleDeleteClient(client.id)} variant="danger" className="text-sm py-1">
                                    Eliminar
                                </Button>
                            </li>
                        )) : (
                             <p className="text-center text-slate-500 py-8">No hay clientes registrados.</p>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ClientsManager;