
import React from 'react';
import { HashRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { ServiceNote as ServiceNoteType } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { COMPANY_NAME, COMPANY_LOGO } from './constants';
import ServiceNote from './components/ServiceNote';
import MonthlySummary from './components/MonthlySummary';
import { v4 as uuidv4 } from 'uuid';
import { PlusIcon } from './components/Icons';

const Home = ({ notes }: { notes: ServiceNoteType[] }) => (
    <div className="p-8">
        <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold text-slate-800">Panel de Control</h1>
                <Link to="/note/new">
                    <button className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Nueva Nota de Servicio
                    </button>
                </Link>
            </div>
            <h2 className="text-xl font-semibold text-slate-700 mb-4">Notas de Servicio Recientes</h2>
            <div className="space-y-4">
                {notes.length > 0 ? (
                    [...notes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(note => (
                        <Link to={`/note/${note.id}`} key={note.id} className="block p-4 bg-slate-50 border border-slate-200 rounded-lg hover:shadow-lg hover:border-blue-500 transition duration-300">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-lg text-slate-800">{note.clientName}</p>
                                    <p className="text-sm text-slate-600">Proyecto: {note.project}</p>
                                    <p className="text-xs text-slate-500 mt-1">Asesor: {note.consultantName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-600">{new Date(note.date).toLocaleDateString()}</p>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${note.format === 'Presencial' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                                        {note.format}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p className="text-center text-slate-500 py-8">No hay notas de servicio. ¡Crea una para empezar!</p>
                )}
            </div>
        </div>
    </div>
);

const ServiceNoteWrapper = ({ notes, setNotes }: { notes: ServiceNoteType[], setNotes: (notes: ServiceNoteType[]) => void }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = id === 'new';
    
    const note = isNew ? undefined : notes.find(n => n.id === id);

    const handleSave = (noteToSave: ServiceNoteType) => {
        if (isNew) {
            setNotes([...notes, { ...noteToSave, id: uuidv4() }]);
        } else {
            setNotes(notes.map(n => n.id === id ? noteToSave : n));
        }
        navigate('/');
    };

    if (!isNew && !note) {
        return <div className="text-center p-8 text-red-500">Nota de servicio no encontrada.</div>;
    }

    return <ServiceNote note={note} onSave={handleSave} />;
};


const App: React.FC = () => {
    const [notes, setNotes] = useLocalStorage<ServiceNoteType[]>('serviceNotes', []);

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
                        <Route path="/" element={<Home notes={notes} />} />
                        <Route path="/note/:id" element={<ServiceNoteWrapper notes={notes} setNotes={setNotes} />} />
                        <Route path="/summary" element={<MonthlySummary notes={notes} />} />
                    </Routes>
                </main>
            </div>
        </HashRouter>
    );
};

export default App;

