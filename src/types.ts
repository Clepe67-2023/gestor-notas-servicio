
export interface Client {
    id: string;
    name: string;
    rut: string;
}

export interface Project {
    id: string;
    name: string;
    clientId: string | null;
}

export interface Consultant {
    id: string;
    name: string;
}

export interface ServiceNote {
    id: string;
    clientId: string;
    projectId: string;
    format: 'Presencial' | 'Streaming';
    date: string;
    startTime: string;
    endTime: string;
    consultantId: string;
    clientRepresentative: string;
    description: string;
    consultantSignature: string; // Base64 data URL
    clientSignature: string; // Base64 data URL
}