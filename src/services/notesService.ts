import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase"; // Asegúrate que la ruta a firebase.js sea correcta
import { ServiceNote } from "../types"; // Asegúrate que la ruta a types.ts sea correcta

const NOTES_COLLECTION = 'notas'; // Usaremos 'notas' como el nombre de la colección

/**
 * Obtiene todas las notas de servicio desde Firestore.
 * @returns Una promesa que se resuelve con un arreglo de notas de servicio.
 */
export const getNotesFromFirestore = async (): Promise<ServiceNote[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, NOTES_COLLECTION));
    
    // 1. Se crea un arreglo vacío
    const notesArray: ServiceNote[] = [];

    // 2. Se recorre cada documento y se añade al arreglo
    querySnapshot.forEach((doc) => {
      notesArray.push({
        id: doc.id,
        ...doc.data()
      } as ServiceNote);
    });

    // 3. Se devuelve el arreglo completo con todas las notas
    return notesArray;

  } catch (e) {
    console.error("Error al obtener las notas: ", e);
    // Lanza el error para que el componente que llama pueda manejarlo
    throw new Error("No se pudieron obtener las notas desde la base de datos.");
  }
};

/**
 * Guarda una nueva nota de servicio en Firestore.
 * @param note El objeto de la nota a guardar (sin el id).
 */
export const saveNoteToFirestore = async (note: Omit<ServiceNote, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, NOTES_COLLECTION), note);
    console.log("Nota guardada con ID: ", docRef.id);
    return docRef.id; // Devuelve el ID del nuevo documento
  } catch (e) {
    console.error("Error al guardar la nota: ", e);
    throw new Error("No se pudo guardar la nota en la base de datos.");
  }
};