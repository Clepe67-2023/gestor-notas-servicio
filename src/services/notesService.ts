import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ServiceNote } from '../types';

const NOTES_COLLECTION = 'serviceNotes';

/**
 * Obtiene todas las notas de servicio desde Firestore.
 * @returns Una promesa que se resuelve con un array de notas de servicio.
 */
export const getNotesFromFirestore = async (): Promise<ServiceNote[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, NOTES_COLLECTION));
        const notes = querySnapshot.docs.map(doc => {
            // Aseguramos que los datos se ajusten al tipo ServiceNote, incluyendo el id del documento
            return {
                id: doc.id,
                ...doc.data()
            } as ServiceNote;
        });
        return notes;
    } catch (e) {
        console.error("Error al obtener las notas: ", e);
        // Lanza el error para que el componente que llama pueda manejarlo (e.g., mostrar un mensaje al usuario)
        throw new Error("No se pudieron obtener las notas desde la base de datos.");
    }
};

/**
 * Guarda (crea o actualiza) una nota de servicio en Firestore.
 * La función utiliza `setDoc`, que creará el documento si no existe, o lo sobrescribirá si ya existe.
 * @param note La nota de servicio a guardar. Debe incluir un ID.
 */
export const saveNoteToFirestore = async (note: ServiceNote): Promise<void> => {
    try {
        const noteDocRef = doc(db, NOTES_COLLECTION, note.id);
        // Extraemos el id para no guardarlo como un campo dentro del documento de Firestore.
        // El ID ya es la clave del documento.
        const { id, ...noteData } = note;
        await setDoc(noteDocRef, noteData);
    } catch (e) {
        console.error("Error al guardar la nota: ", e);
        throw new Error("No se pudo guardar la nota en la base de datos.");
    }
};