import React, { useState, useMemo } from 'react';
import { Project, Client, ServiceNote } from '../types';
import { v4 as uuidv4 } from 'uuid';
import Button from './common/Button';

interface ProjectsManagerProps {
    projects: Project[];
    setProjects: (projects: Project[]) => void;
    clients: Client[];
    notes: ServiceNote[];
}

const ProjectsManager: React.FC<ProjectsManagerProps> = ({ projects, setProjects, clients, notes }) => {
    const [newProjectName, setNewProjectName] = useState('');
    const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');

    const handleAddProject = (e: React.FormEvent) => {
        e.preventDefault();
        if (newProjectName.trim() === '' || !selectedClientId) {
            alert("Por favor, rellene el nombre del proyecto y seleccione un cliente.");
            return;
        }

        const newProject: Project = {
            id: uuidv4(),
            name: newProjectName.trim(),
            clientId: selectedClientId,
        };
        setProjects([...projects, newProject]);
        setNewProjectName('');
    };
    
    const handleDeleteProject = (projectId: string) => {
        const notesWithProject = notes.filter(n => n.projectId === projectId).length;
        if (notesWithProject > 0) {
            alert(`No se puede eliminar este proyecto porque está siendo utilizado en ${notesWithProject} nota(s) de servicio.`);
            return;
        }
        if (window.confirm("¿Está seguro de que desea eliminar este proyecto?")) {
            setProjects(projects.filter(p => p.id !== projectId));
        }
    };

    const projectsByClient = useMemo(() => {
        return projects.reduce((acc, project) => {
            const clientName = clients.find(c => c.id === project.clientId)?.name || 'Cliente Desconocido';
            if (!acc[clientName]) {
                acc[clientName] = [];
            }
            acc[clientName].push(project);
            return acc;
        }, {} as Record<string, Project[]>);
    }, [projects, clients]);


    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-slate-800 mb-6 border-b pb-4">Gestionar Proyectos</h1>
                
                <form onSubmit={handleAddProject} className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label htmlFor="newProjectName" className="block text-sm font-medium text-slate-700">Nombre del Proyecto</label>
                        <input
                            type="text"
                            id="newProjectName"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ej: Desarrollo Web Corporativa"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="client" className="block text-sm font-medium text-slate-700">Cliente</label>
                        <select
                            id="client"
                            value={selectedClientId}
                            onChange={(e) => setSelectedClientId(e.target.value)}
                            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required>
                            <option value="" disabled>Seleccione un cliente</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-3">
                        <Button type="submit" className="w-full md:w-auto">Añadir Proyecto</Button>
                    </div>
                </form>

                <div>
                    <h2 className="text-xl font-semibold text-slate-700 mb-4">Lista de Proyectos</h2>
                    <div className="space-y-6">
                        {Object.keys(projectsByClient).length > 0 ? Object.entries(projectsByClient).map(([clientName, clientProjects]) => (
                            <div key={clientName}>
                                <h3 className="text-lg font-semibold text-slate-600 border-b pb-2 mb-3">{clientName}</h3>
                                <ul className="space-y-2">
                                    {clientProjects.map(project => (
                                        <li key={project.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
                                            <span className="text-slate-800">{project.name}</span>
                                            <Button onClick={() => handleDeleteProject(project.id)} variant="danger" className="text-sm py-1">
                                                Eliminar
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )) : (
                             <p className="text-center text-slate-500 py-8">No hay proyectos registrados. Añada primero un cliente.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectsManager;