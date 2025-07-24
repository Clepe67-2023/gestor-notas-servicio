export interface Client {
    id: string;
    name: string;
}

export interface Project {
    id: string;
    name: string;
    clientId: string;
}

export interface Consultant {
    id: string;
    name: string;
}

export interface ServiceNote {
    id: string;
    projectId: string;
    consultantId: string;
    format: 'Presencial' | 'Streaming';
    date: string;
    startTime: string;
    endTime: string;
    clientRepresentative: string;
    description: string;
    consultantSignature: string; // Base64 data URL
    clientSignature: string; // Base64 data URL
}