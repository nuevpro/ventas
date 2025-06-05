
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
      console.log('Starting optimized file upload:', file.name, file.type, file.size);

      // Convertir archivo a base64 para procesamiento
      const base64Content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1]; // Remover data:xxx;base64,
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

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

      console.log('File record created, starting AI extraction...');

      // Procesamiento inmediato con IA
      const { data: extractionData, error: extractionError } = await supabase.functions.invoke('extract-document-content', {
        body: {
          fileContent: base64Content,
          fileName: file.name,
          fileType: file.type
        }
      });

      if (extractionError) {
        console.error('AI extraction error:', extractionError);
        throw new Error(`Error en extracción IA: ${extractionError.message}`);
      }

      console.log('AI extraction completed successfully');

      // Actualizar archivo con contenido extraído
      const { error: updateError } = await supabase
        .from('uploaded_files')
        .update({
          content_extracted: extractionData.extractedContent,
          processing_status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', fileData.id);

      if (updateError) {
        console.error('Error updating file:', updateError);
      }

      // Crear entrada en knowledge_base con análisis IA
      const { error: kbError } = await supabase
        .from('knowledge_base')
        .insert({
          title: extractionData.fileName,
          content: extractionData.extractedContent,
          document_type: 'uploaded_file',
          tags: [extractionData.documentType, 'archivo'],
          ai_summary: extractionData.aiSummary,
          key_points: extractionData.keyPoints,
          file_id: fileData.id,
          extraction_status: 'completed',
          processing_metadata: {
            salesRelevant: extractionData.salesRelevant,
            importantData: extractionData.importantData,
            wordCount: extractionData.wordCount,
            extractedAt: extractionData.extractedAt
          }
        });

      if (kbError) {
        console.error('Error saving to knowledge base:', kbError);
        throw new Error('Error al guardar en la base de conocimientos');
      }

      toast({
        title: "¡Extracción Completada!",
        description: `${file.name} procesado completamente con IA y agregado a la base de conocimientos`,
      });

      await loadFiles();
      return fileData;

    } catch (error) {
      console.error('Error in optimized file upload:', error);
      toast({
        title: "Error",
        description: `Error al procesar archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`,
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
