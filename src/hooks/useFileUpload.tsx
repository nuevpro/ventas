import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UploadedFile {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  upload_url?: string;
  content_extracted?: string;
  processing_status: string;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

export const useFileUpload = () => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('uploaded_files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error loading files:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los archivos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      console.log('Starting file upload:', file.name, file.type, file.size);

      // Crear registro básico del archivo
      const { data: fileData, error: fileError } = await supabase
        .from('uploaded_files')
        .insert({
          filename: file.name,
          file_type: file.type,
          file_size: file.size,
          processing_status: 'processing'
        })
        .select()
        .single();

      if (fileError) throw fileError;

      console.log('File record created successfully:', fileData.id);
      
      toast({
        title: "Archivo cargado",
        description: "Procesando contenido con IA...",
      });

      return fileData;
    } catch (error) {
      console.error('Error in file upload:', error);
      toast({
        title: "Error",
        description: `Error al cargar archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      // Eliminar de knowledge_base primero
      await supabase
        .from('knowledge_base')
        .delete()
        .eq('file_id', fileId);

      // Luego eliminar el archivo
      const { error } = await supabase
        .from('uploaded_files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      toast({
        title: "¡Éxito!",
        description: "Archivo eliminado correctamente",
      });

      await loadFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Error",
        description: "Error al eliminar archivo",
        variant: "destructive",
      });
    }
  };

  return {
    files,
    loading,
    uploading,
    loadFiles,
    uploadFile,
    deleteFile
  };
};