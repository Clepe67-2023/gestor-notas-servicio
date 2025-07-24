import React, { useState, useRef } from 'react';
import { ServiceNote as ServiceNoteType } from '../types';
import Header from './Header';
import SignaturePad from './SignaturePad';
import Modal from './common/Modal';
import Button from './common/Button';
import { generateServiceDescription } from '../services/geminiService';
import { useNavigate } from 'react-router-dom';
import { PrintIcon, EmailIcon, SparklesIcon } from './Icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CONSULTANTS } from '../constants';

interface ServiceNoteProps {
    note?: ServiceNoteType;
    onSave: (note: ServiceNoteType) => void;
}

const ServiceNote: React.FC<ServiceNoteProps> = ({ note, onSave }) => {
    const navigate = useNavigate();
    const printRef = useRef<HTMLDivElement>(null);
    const [formData, setFormData] = useState<Omit<ServiceNoteType, 'id'>>({
        clientName: note?.clientName || '',
        project: note?.project || '',
        format: note?.format || 'Presencial',
        date: note?.date || new Date().toISOString().split('T')[0],
        startTime: note?.startTime || '09:00',
        endTime: note?.endTime || '18:00',
        consultantName: note?.consultantName || CONSULTANTS[0] || '',
        clientRepresentative: note?.clientRepresentative || '',
        description: note?.description || '',
        consultantSignature: note?.consultantSignature || '',
        clientSignature: note?.clientSignature || '',
    });

    const [isEmailModalOpen, setEmailModalOpen] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [keywords, setKeywords] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerateDescription = async () => {
        setIsGenerating(true);
        setGenerationError('');
        const result = await generateServiceDescription(keywords);
        if (result.success) {
            setFormData(prev => ({ ...prev, description: result.data }));
        } else {
            setGenerationError(result.data);
        }
        setIsGenerating(false);
    };

    const handlePrintPdf = async () => {
        const element = printRef.current;
        if (!element) return;

        setIsPrinting(true);

        try {
            const canvas = await html2canvas(element, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
            });
            const data = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProperties = pdf.getImageProperties(data);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
            
            pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`nota-de-servicio-${formData.project || 'general'}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Hubo un error al generar el PDF. Por favor, intente de nuevo.");
        } finally {
            setIsPrinting(false);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: note?.id || '' });
    };

    const emailBody = `
Estimado(a) ${formData.clientRepresentative || formData.clientName},

Adjunto encontrará la nota de servicio correspondiente a la sesión del ${new Date(formData.date).toLocaleDateString()} para el proyecto "${formData.project}".

Resumen del servicio:
${formData.description}

Por favor, revise el documento y, si está de acuerdo, proceda con su firma de conformidad.

Quedo a su disposición para cualquier consulta.

Saludos cordiales,
${formData.consultantName}
    `.trim().replace(/\n/g, '%0A').replace(/ /g, '%20');
    
    const emailSubject = `Nota de Servicio: Proyecto ${formData.project} - ${new Date(formData.date).toLocaleDateString()}`;

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex justify-end space-x-3 mb-6 no-print">
                <Button onClick={handlePrintPdf} isLoading={isPrinting} variant="secondary">
                    <PrintIcon className="w-5 h-5 mr-2" /> Imprimir / Guardar PDF
                </Button>
                <Button onClick={() => setEmailModalOpen(true)} type="button" variant="secondary">
                    <EmailIcon className="w-5 h-5 mr-2" /> Preparar Correo
                </Button>
            </div>
            
            <form onSubmit={handleSubmit}>
                <div ref={printRef} className="bg-white p-8 md:p-12 shadow-lg rounded-lg print-view">
                    <Header />
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Fields */}
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Cliente / Razón Social</label>
                                <input type="text" name="clientName" value={formData.clientName} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Proyecto</label>
                                <input type="text" name="project" value={formData.project} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700">Nombre del Asesor</label>
                                <select name="consultantName" value={formData.consultantName} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required>
                                    {CONSULTANTS.map(name => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Fecha</label>
                                <input type="date" name="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Hora de Inicio</label>
                                <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Hora de Término</label>
                                <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                            </div>
                        </div>
                        <div className="md:col-span-1">
                             <label className="block text-sm font-medium text-slate-700">Responsable / Cliente</label>
                             <input type="text" name="clientRepresentative" value={formData.clientRepresentative} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                        </div>
                         <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-slate-700">Formato</label>
                            <select name="format" value={formData.format} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                <option>Presencial</option>
                                <option>Streaming</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700">Descripción del Servicio Realizado</label>
                            <div className="mt-1 flex rounded-md shadow-sm no-print">
                                <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="Palabras clave para IA..." className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-slate-300" />
                                <Button type="button" onClick={handleGenerateDescription} isLoading={isGenerating} className="rounded-l-none">
                                    <SparklesIcon className="w-5 h-5 mr-2"/> Generar
                                </Button>
                            </div>
                            {generationError && (
                                <p className="mt-2 text-sm text-red-600 no-print">{generationError}</p>
                            )}
                            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={6} className="mt-2 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required></textarea>
                        </div>
                        {/* Signatures */}
                        <div className="mt-10 pt-6 border-t-2 border-dashed border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8 md:col-span-2">
                            <SignaturePad title={`Firma de ${formData.consultantName}`} onSave={(data) => setFormData(prev => ({ ...prev, consultantSignature: data }))} signatureDataUrl={formData.consultantSignature} isSigned={!!formData.consultantSignature} />
                            <SignaturePad title="Firma del Cliente (Conformidad)" onSave={(data) => setFormData(prev => ({ ...prev, clientSignature: data }))} signatureDataUrl={formData.clientSignature} isSigned={!!formData.clientSignature} />
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end space-x-4 no-print">
                    <Button type="button" variant="secondary" onClick={() => navigate('/')}>Cancelar</Button>
                    <Button type="submit">Guardar Nota de Servicio</Button>
                </div>
            </form>
            
            <Modal isOpen={isEmailModalOpen} onClose={() => setEmailModalOpen(false)} title="Preparar Correo Electrónico">
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        Esta función prepara un correo para que lo envíe desde su cliente de correo preferido.
                        Haga clic en el botón de abajo para abrirlo, o copie y pegue el contenido manualmente.
                        No olvide adjuntar el PDF que generó.
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Asunto</label>
                        <input type="text" readOnly value={emailSubject} className="mt-1 block w-full bg-slate-100 border-slate-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Cuerpo del Mensaje</label>
                        <textarea readOnly rows={10} value={decodeURIComponent(emailBody.replace(/%0A/g, '\n'))} className="mt-1 block w-full bg-slate-100 border-slate-300 rounded-md shadow-sm"></textarea>
                    </div>
                    <div className="flex justify-end">
                        <a href={`mailto:?subject=${emailSubject}&body=${emailBody}`}
                           className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 inline-flex items-center">
                           <EmailIcon className="w-5 h-5 mr-2" /> Abrir en Cliente de Correo
                        </a>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ServiceNote;