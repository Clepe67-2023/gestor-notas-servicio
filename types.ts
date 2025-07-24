export interface ServiceNote {
    id: string;
    clientName: string;
    project: string;
    format: 'Presencial' | 'Streaming';
    date: string;
    startTime: string;
    endTime: string;
    consultantName: string;
    clientRepresentative: string;
    description: string;
    consultantSignature: string; // Base64 data URL
    clientSignature: string; // Base64 data URL
}
