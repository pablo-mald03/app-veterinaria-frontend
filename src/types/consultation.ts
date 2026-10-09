// Modelos que usa la interfaz (el servicio los arma con los datos crudos del backend).

/** Una consulta ya completada, lista para mostrar en el historial. */
export interface ConsultationView {
  idAppointment: number;
  idPet: number;
  date: string;
  hour: string;
  reason: string;
  diagnosis: string;
  treatment: string;
  cost: number;
}

/** Lo que captura el formulario "Registrar consulta" (consulta ya realizada). */
export interface ConsultationInput {
  reason: string;
  diagnosis: string;
  treatment: string;
  cost: number;
}
