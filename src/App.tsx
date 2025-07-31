
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { ServiceNote as ServiceNoteType, Client, Project, Consultant } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { COMPANY_NAME, COMPANY_LOGO } from './constants';
import ServiceNote from './components/ServiceNote';
import MonthlySummary from './components/MonthlySummary';
import { v4 as uuidv4 } from 'uuid';
import { PlusIcon, EditIcon, DeleteIcon } from './components/Icons';
import Modal from './components/common/Modal';
import Button from './components/common/Button';

// Generic Management Section Component
interface ManagementField<T> {
    name: keyof T;
    label: string;
    type?: 'text' | 'select';
    placeholder?: string;
    options?: { value: string; label: string }[];
}

interface ManagementSectionProps<T extends { id: string; name: string }> {
    title: string;
    items: T[];
    setItems: (value: T[] | ((val: T[]) => T[])) => void;
    fields: ManagementField<Partial<T>>[];
    itemName: string;
    getDisplayInfo: (item: T) => { name: string; details?: string };
}

const ManagementSection = <T extends { id: string; name: string }>({
    title,
    items,
    setItems,
    fields,
    itemName,
    getDisplayInfo,
}: ManagementSectionProps<T>) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<T | null>(null);
    const [formData, setFormData] = useState<Partial<T>>({});

    const openModal = (item: T | null = null) => {
        setCurrentItem(item);
        if (item) {
            setFormData(item);
        } else {
            const initialFormData = fields.reduce((acc, field) => {
                (acc as any)[field.name] = '';
                return acc;
            }, {} as Partial<T>);
            setFormData(initialFormData);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
        setFormData({});
    };

    const handleSave = () => {
        const dataToSave: Partial<T> = { ...formData };
        fields.forEach(field => {
            if (field.type === 'select' && (dataToSave as any)[field.name] === '') {
                (dataToSave as any)[field.name] = null;
            }
        });

        if (currentItem) {
            setItems(items.map(item => item.id === currentItem.id ? { ...item, ...dataToSave } : item));
        } else {
            setItems([...items, { ...dataToSave, id: uuidv4() } as T]);
        }
        closeModal();
    };

    const handleDelete = (id: string) => {
        if (window.confirm(`¿Está seguro de que desea eliminar este ${itemName.toLowerCase()}?`)) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-700">{title}</h2>
                <Button onClick={() => openModal()} className="py-1 px-3 text-sm">
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Añadir {itemName}
                </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {items.length > 0 ? (
                    items.map(item => {
                        const display = getDisplayInfo(item);
                        return (
                            <div key={item.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-md">
                                <div>
                                    <p className="font-medium text-slate-800">{display.name}</p>
                                    {display.details && <p className="text-xs text-slate-500">{display.details}</p>}
                                </div>
                                <div className="space-x-2 flex items-center">
                                    <button onClick={() => openModal(item)} className="text-slate-500 hover:text-blue-600"><EditIcon className="w-4 h-4"/></button>
                                    <button onClick={() => handleDelete(item.id)} className="text-slate-500 hover:text-red-600"><DeleteIcon className="w-4 h-4"/></button>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <p className="text-center text-slate-500 py-4">No hay {itemName.toLowerCase()}s. Añada uno para empezar.</p>
                )}
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={`${currentItem ? 'Editar' : 'Añadir'} ${itemName}`}>
                <div className="space-y-4">
                    {fields.map(field => (
                        <div key={field.name as string}>
                            <label className="block text-sm font-medium text-slate-700">{field.label}</label>
                             {field.type === 'select' ? (
                                <select
                                    name={field.name as string}
                                    value={(formData as any)[field.name] || ''}
                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                    className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">{field.placeholder || 'Seleccionar...'}</option>
                                    {field.options?.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    name={field.name as string}
                                    value={(formData as any)[field.name] || ''}
                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                    className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            )}
                        </div>
                    ))}
                    <div className="flex justify-end space-x-2">
                        <Button variant="secondary" onClick={closeModal}>Cancelar</Button>
                        <Button onClick={handleSave}>Guardar</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

interface HomeProps {
    notes: ServiceNoteType[];
    clients: Client[];
    setClients: (value: Client[] | ((val: Client[]) => Client[])) => void;
    projects: Project[];
    setProjects: (value: Project[] | ((val: Project[]) => Project[])) => void;
    consultants: Consultant[];
    setConsultants: (value: Consultant[] | ((val: Consultant[]) => Consultant[])) => void;
}

const Home = ({ notes, clients, setClients, projects, setProjects, consultants, setConsultants }: HomeProps) => {
    const getNoteDisplayData = (note: ServiceNoteType) => {
        const clientName = clients.find(c => c.id === note.clientId)?.name || 'Cliente no encontrado';
        const projectName = projects.find(p => p.id === note.projectId)?.name || 'Proyecto no encontrado';
        const consultantName = consultants.find(c => c.id === note.consultantId)?.name || 'No asignado';
        return { clientName, projectName, consultantName };
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h1 className="text-3xl font-bold text-slate-800">Panel de Control</h1>
                    <Link to="/note/new">
                        <Button>
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Nueva Nota de Servicio
                        </Button>
                    </Link>
                </div>
                <h2 className="text-xl font-semibold text-slate-700 mb-4">Notas de Servicio Recientes</h2>
                <div className="space-y-4">
                    {notes.length > 0 ? (
                        [...notes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map(note => {
                            const { clientName, projectName, consultantName } = getNoteDisplayData(note);
                            return (
                                <Link to={`/note/${note.id}`} key={note.id} className="block p-4 bg-slate-50 border border-slate-200 rounded-lg hover:shadow-lg hover:border-blue-500 transition duration-300">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-lg text-slate-800">{clientName}</p>
                                            <p className="text-sm text-slate-600">Proyecto: {projectName}</p>
                                            <p className="text-xs text-slate-500 mt-1">Asesor: {consultantName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-slate-600">{new Date(note.date).toLocaleDateString()}</p>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${note.format === 'Presencial' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                                                {note.format}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })
                    ) : (
                        <p className="text-center text-slate-500 py-8">No hay notas de servicio. ¡Crea una para empezar!</p>
                    )}
                </div>
            </div>

            <div className="max-w-5xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <ManagementSection title="Clientes" items={clients} setItems={setClients} fields={[{ name: 'name', label: 'Nombre / Razón Social' }, { name: 'rut', label: 'RUT' }]} itemName="Cliente" getDisplayInfo={(item) => ({ name: item.name, details: `RUT: ${item.rut}` })} />
                <ManagementSection 
                    title="Proyectos" 
                    items={projects} 
                    setItems={setProjects} 
                    fields={[
                        { name: 'name', label: 'Nombre del Proyecto' },
                        { name: 'clientId', label: 'Cliente Asociado (Opcional)', type: 'select', placeholder: 'Ningún cliente específico', options: clients.map(c => ({value: c.id, label: c.name}))}
                    ]} 
                    itemName="Proyecto"
                    getDisplayInfo={(item) => ({ name: item.name, details: item.clientId ? `Cliente: ${clients.find(c => c.id === item.clientId)?.name || 'N/A'}` : 'Sin cliente asociado' })}
                 />
                <ManagementSection title="Asesores" items={consultants} setItems={setConsultants} fields={[{ name: 'name', label: 'Nombre del Asesor' }]} itemName="Asesor" getDisplayInfo={(item) => ({ name: item.name })} />
            </div>
        </div>
    );
};

interface ServiceNoteWrapperProps {
    notes: ServiceNoteType[];
    setNotes: (value: ServiceNoteType[] | ((val: ServiceNoteType[]) => ServiceNoteType[])) => void;
    clients: Client[];
    projects: Project[];
    consultants: Consultant[];
}

const ServiceNoteWrapper = ({ notes, setNotes, clients, projects, consultants }: ServiceNoteWrapperProps) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const note = isNew ? undefined : notes.find(n => n.id === id);

    const handleSave = (noteToSave: Omit<ServiceNoteType, 'id'>) => {
        if (isNew) {
            setNotes([...notes, { ...noteToSave, id: uuidv4() }]);
        } else {
            setNotes(notes.map((n: ServiceNoteType) => (n.id === id ? { ...noteToSave, id: id! } : n)));
        }
        navigate('/');
    };

    if (!isNew && !note) {
        return <div className="text-center p-8 text-red-500">Nota de servicio no encontrada.</div>;
    }

    return <ServiceNote note={note} onSave={handleSave} clients={clients} projects={projects} consultants={consultants} />;
};


const App: React.FC = () => {
    const [notes, setNotes] = useLocalStorage<ServiceNoteType[]>('serviceNotes', []);
    const [clients, setClients] = useLocalStorage<Client[]>('clients', []);
    const [projects, setProjects] = useLocalStorage<Project[]>('projects', []);
    const [consultants, setConsultants] = useLocalStorage<Consultant[]>('consultants', []);

    return (
        <HashRouter>
            <div className="min-h-screen bg-slate-100 font-sans">
                <header className="bg-white shadow-md no-print">
                    <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-20">
                            <Link to="/" className="flex items-center space-x-3">
                                {COMPANY_LOGO}
                                <span className="text-2xl font-bold text-slate-800">{COMPANY_NAME}</span>
                            </Link>
                            <div className="flex items-center space-x-6">
                                <Link to="/" className="text-slate-600 hover:text-blue-600 font-medium transition">Panel</Link>
                                <Link to="/summary" className="text-slate-600 hover:text-blue-600 font-medium transition">Resumen Mensual</Link>
                            </div>
                        </div>
                    </nav>
                </header>
                <main>
                    <Routes>
                        <Route path="/" element={<Home notes={notes} clients={clients} setClients={setClients} projects={projects} setProjects={setProjects} consultants={consultants} setConsultants={setConsultants} />} />
                        <Route path="/note/:id" element={<ServiceNoteWrapper notes={notes} setNotes={setNotes} clients={clients} projects={projects} consultants={consultants} />} />
                        <Route path="/summary" element={<MonthlySummary notes={notes} clients={clients} projects={projects} consultants={consultants} />} />
                    </Routes>
                </main>
            </div>
        </HashRouter>
    );
};

export default App;