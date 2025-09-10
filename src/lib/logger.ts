// src/lib/logger.ts
import { createClient } from './supabaseClient';

/**
 * Registra un error en la tabla 'logs' de la base de datos de Supabase.
 * @param error - El objeto de error capturado. Puede ser de cualquier tipo.
 * @param location - Un string que identifica dónde ocurrió el error (ej: 'AuthContext.signUpWithEmail').
 */
export async function logErrorToSupabase(error: unknown, location: string) {
  try {
    const supabase = createClient();
    
    // Intenta obtener el usuario actual para asociar el error a su sesión
    const { data: { user } } = await supabase.auth.getUser();

    // Prepara los detalles del error para guardarlos como JSON
    let errorDetails;
    if (error instanceof Error) {
      // Si es un objeto Error estándar, extraemos sus propiedades
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (typeof error === 'object' && error !== null) {
      // Si es otro tipo de objeto
      errorDetails = error;
    } else {
      // Si es un string o cualquier otro primitivo
      errorDetails = { message: String(error) };
    }

    const { error: insertError } = await supabase.from('logs').insert({
      user_id: user?.id || null,
      location: location,
      error_details: errorDetails,
      is_resolved: false,
    });

    if (insertError) {
      console.error('Error al intentar guardar un log en Supabase:', insertError);
    }
  } catch (loggingError) {
    console.error('Fallo crítico en el sistema de logging:', loggingError);
  }
}