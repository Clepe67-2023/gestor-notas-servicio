
import React, { useState, useMemo, useRef } from 'react';
import { ServiceNote, Client, Project, Consultant } from '../types';
import Modal from './common/Modal';
import Button from './common/Button';
import { PrintIcon, EmailIcon } from './Icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface MonthlySummaryProps {
  notes: ServiceNote[];
  clients: Client[];
  projects: Project[];
  consultants: Consultant[];
}

const MonthlySummary: React.FC<MonthlySummaryProps> = ({ notes, clients, projects, consultants }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isEmailModalOpen, setEmailModalOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const noteDate = new Date(note.date);
      return noteDate.getMonth() === selectedMonth && noteDate.getFullYear() === selectedYear;
    });
  }, [notes, selectedMonth, selectedYear]);

  const calculateTotalHours = (startTime: string, endTime: string): number => {
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    if (end.getTime() < start.getTime()) end.setDate(end.getDate() + 1); // Handle overnight case
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  };
  
  const totalMonthHours = useMemo(() => {
    return filteredNotes.reduce((total, note) => {
        return total + calculateTotalHours(note.startTime, note.endTime);
    }, 0)
  }, [filteredNotes]);
  
  const monthName = useMemo(() => 
    new Date(selectedYear, selectedMonth).toLocaleString('es-ES', { month: 'long' })
  , [selectedMonth, selectedYear]);

  const years = useMemo(() => {
    const availableYears = [...new Set(notes.map(note => new Date(note.date).getFullYear()))];
    if (!availableYears.includes(new Date().getFullYear())) {
        availableYears.push(new Date().getFullYear());
    }
    return availableYears.sort((a, b) => b - a);
  }, [notes]);
  
  const handlePrintPdf = async () => {
    const element = printRef.current;
    if (!element) return;

    setIsPrinting(true);
    try {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const data = canvas.toDataURL('image/png');

        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProperties = pdf.getImageProperties(data);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
        
        pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`resumen-mensual-${monthName}-${selectedYear}.pdf`);
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Hubo un error al generar el PDF. Por favor, intente de nuevo.");
    } finally {
        setIsPrinting(false);
    }
  };

  const getNoteDisplayData = (note: ServiceNote) => {
    const clientName = clients.find(c => c.id === note.clientId)?.name || 'N/A';
    const projectName = projects.find(p => p.id === note.projectId)?.name || 'N/A';
    const consultantName = consultants.find(c => c.id === note.consultantId)?.name || 'N/A';
    return { clientName, projectName, consultantName };
  };

  const summaryText = filteredNotes.map(note => {
    const { projectName, consultantName } = getNoteDisplayData(note);
    return `- ${new Date(note.date).toLocaleDateString()}: ${consultantName} - Proyecto "${projectName}" (${calculateTotalHours(note.startTime, note.endTime).toFixed(2)} horas)`
  }).join('\n');

  const emailBody = `
Estimados,

Adjunto el resumen de horas de servicio correspondientes al mes de ${monthName} de ${selectedYear}.

Detalle de servicios:
${summaryText}

Total de horas facturables para el mes: ${totalMonthHours.toFixed(2)} horas.

Quedo a su disposición.

Saludos cordiales,
El Equipo de Asesores
  `.trim().replace(/\n/g, '%0A').replace(/ /g, '%20');

  const emailSubject = `Resumen de Horas de Servicio - ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${selectedYear}`;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold text-slate-800">Resumen Mensual de Horas</h1>
          <div className="flex items-center space-x-2 mt-4 md:mt-0 no-print">
            <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="border-slate-300 rounded-md shadow-sm">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>{new Date(0, i).toLocaleString('es-ES', { month: 'long' })}</option>
              ))}
            </select>
            <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="border-slate-300 rounded-md shadow-sm">
              {years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mb-6 no-print">
            <Button onClick={handlePrintPdf} isLoading={isPrinting} variant="secondary">
                <PrintIcon className="w-5 h-5 mr-2" /> Imprimir / Guardar PDF
            </Button>
            <Button onClick={() => setEmailModalOpen(true)} type="button" variant="secondary">
                <EmailIcon className="w-5 h-5 mr-2" /> Preparar Correo
            </Button>
        </div>

        <div ref={printRef} className="print-view p-4">
          <h2 className="text-2xl font-semibold text-center text-slate-700 mb-2">
            Desglose de Horas - {monthName.charAt(0).toUpperCase() + monthName.slice(1)} {selectedYear}
          </h2>
          <div className="overflow-x-auto mt-6">
            <table className="min-w-full bg-white border border-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  <th className="py-3 px-4 border-b text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">Cliente</th>
                  <th className="py-3 px-4 border-b text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">Proyecto</th>
                  <th className="py-3 px-4 border-b text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">Asesor</th>
                  <th className="py-3 px-4 border-b text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">Fecha</th>
                  <th className="py-3 px-4 border-b text-right text-sm font-semibold text-slate-600 uppercase tracking-wider">Horas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredNotes.length > 0 ? filteredNotes.map(note => {
                  const { clientName, projectName, consultantName } = getNoteDisplayData(note);
                  return (
                    <tr key={note.id}>
                        <td className="py-3 px-4 whitespace-nowrap">{clientName}</td>
                        <td className="py-3 px-4 whitespace-nowrap">{projectName}</td>
                        <td className="py-3 px-4 whitespace-nowrap">{consultantName}</td>
                        <td className="py-3 px-4 whitespace-nowrap">{new Date(note.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4 whitespace-nowrap text-right font-medium">{calculateTotalHours(note.startTime, note.endTime).toFixed(2)}</td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500">No hay datos para el período seleccionado.</td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-slate-100">
                  <tr>
                      <td colSpan={4} className="py-3 px-4 text-right font-bold text-slate-700 uppercase">Total de Horas</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800 text-lg">{totalMonthHours.toFixed(2)}</td>
                  </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <Modal isOpen={isEmailModalOpen} onClose={() => setEmailModalOpen(false)} title="Preparar Correo de Resumen Mensual">
            <div className="space-y-4">
                <p className="text-sm text-slate-600">
                    Use el siguiente contenido para enviar el resumen mensual. No olvide adjuntar el PDF.
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
    </div>
  );
};

export default MonthlySummary;