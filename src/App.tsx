
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { ServiceNote as ServiceNoteType, Client, Project, Consultant } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { COMPANY_NAME, COMPANY_LOGO } from './constants';
import ServiceNote from './components/ServiceNote';
import MonthlySummary from './components/MonthlySummary';
import { v4 as uuidv4 } from 'uuid';
import { PlusIcon } from './components/Icons';
import Button from './components/common/Button';
import ClientsManager from './components/ClientsManager';
import ProjectsManager from './components/ProjectsManager';
import ConsultantsManager from './components/ConsultantsManager';
import { getNotesFromFirestore, saveNoteToFirestore } from './services/notesService';

interface HomeProps {
    notes: ServiceNoteType[];
    clients: Client[];
    setClients: (value: Client[]) => void;
    projects: Project[];
    setProjects: (value: Project[]) => void;
    consultants: Consultant[];
    setConsultants: (value: Consultant[]) => void;
    isLoading: boolean;
}

const Home = ({ notes, clients, setClients, projects, setProjects, consultants, setConsultants, isLoading }: HomeProps) => {
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
                {isLoading ? <p className="text-center text-slate-500 py-8">Cargando notas...</p> : (
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
                )}
            </div>

            <div className="max-w-5xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <ClientsManager clients={clients} setClients={setClients} />
                <ProjectsManager projects={projects} setProjects={setProjects} clients={clients} />
                <ConsultantsManager consultants={consultants} setConsultants={setConsultants} />
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
    const [isSaving, setIsSaving] = useState(false);

    const note = isNew ? undefined : notes.find(n => n.id === id);

    const handleSave = async (noteData: Omit<ServiceNoteType, 'id'>) => {
        setIsSaving(true);
        const noteToSave: ServiceNoteType = isNew
            ? { ...noteData, id: uuidv4() }
            : { ...noteData, id: id! };

        try {
            await saveNoteToFirestore(noteToSave);
            
            if (isNew) {
                setNotes(prev => [...prev, noteToSave]);
            } else {
                setNotes(prev => prev.map(n => n.id === id ? noteToSave : n));
            }
            navigate('/');

        } catch (error) {
            console.error("Failed to save note: ", error);
            alert("Error al guardar la nota. Por favor, revise la consola para más detalles e inténtelo de nuevo.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isNew && !note) {
        return <div className="text-center p-8 text-red-500">Nota de servicio no encontrada.</div>;
    }

    return <ServiceNote note={note} onSave={handleSave} clients={clients} projects={projects} consultants={consultants} isSaving={isSaving} />;
};


const App: React.FC = () => {
    const [notes, setNotes] = useState<ServiceNoteType[]>([]);
    const [isLoadingNotes, setIsLoadingNotes] = useState(true);
    const [clients, setClients] = useLocalStorage<Client[]>('clients', []);
    const [projects, setProjects] = useLocalStorage<Project[]>('projects', []);
    const [consultants, setConsultants] = useLocalStorage<Consultant[]>('consultants', []);

    useEffect(() => {
        const loadNotes = async () => {
            setIsLoadingNotes(true);
            try {
                const fetchedNotes = await getNotesFromFirestore();
                setNotes(fetchedNotes);
            } catch (error) {
                console.error("Error loading notes from Firestore: ", error);
                alert("No se pudieron cargar las notas. Verifique su configuración de Firebase y la conexión a internet.");
            } finally {
                setIsLoadingNotes(false);
            }
        };
        loadNotes();
    }, []);

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
                        <Route path="/" element={<Home notes={notes} clients={clients} setClients={setClients} projects={projects} setProjects={setProjects} consultants={consultants} setConsultants={setConsultants} isLoading={isLoadingNotes} />} />
                        <Route path="/note/:id" element={<ServiceNoteWrapper notes={notes} setNotes={setNotes} clients={clients} projects={projects} consultants={consultants} />} />
                        <Route path="/summary" element={<MonthlySummary notes={notes} clients={clients} projects={projects} consultants={consultants} />} />
                    </Routes>
                </main>
            </div>
        </HashRouter>
    );
};

export default App;