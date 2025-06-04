
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type KnowledgeDocument = Database['public']['Tables']['knowledge_base']['Row'];
type KnowledgeInsert = Database['public']['Tables']['knowledge_base']['Insert'];

export const useKnowledgeBase = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading knowledge base documents...');

      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading knowledge base documents:', error);
        throw error;
      }

      console.log('Knowledge base documents loaded successfully:', data);
      setDocuments(data || []);
    } catch (err) {
      console.error('Error in loadDocuments:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar documentos');
      toast({
        title: "Error",
        description: "No se pudieron cargar los documentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async (documentData: {
    title: string;
    content: string;
    document_type?: string;
    tags?: string[];
  }) => {
    try {
      console.log('Creating knowledge base document:', documentData);

      const { data, error } = await supabase
        .from('knowledge_base')
        .insert({
          title: documentData.title,
          content: documentData.content,
          document_type: documentData.document_type || 'manual',
          tags: documentData.tags || []
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating knowledge base document:', error);
        throw error;
      }

      console.log('Knowledge base document created successfully:', data);

      toast({
        title: "¡Éxito!",
        description: "Documento creado correctamente",
      });

      await loadDocuments();
      return data;
    } catch (err) {
      console.error('Error in createDocument:', err);
      toast({
        title: "Error",
        description: "No se pudo crear el documento",
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateDocument = async (documentId: string, documentData: {
    title: string;
    content: string;
    document_type?: string;
    tags?: string[];
  }) => {
    try {
      console.log('Updating knowledge base document:', documentId, documentData);

      const { data, error } = await supabase
        .from('knowledge_base')
        .update({
          title: documentData.title,
          content: documentData.content,
          document_type: documentData.document_type,
          tags: documentData.tags,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)
        .select()
        .single();

      if (error) {
        console.error('Error updating knowledge base document:', error);
        throw error;
      }

      console.log('Knowledge base document updated successfully:', data);

      toast({
        title: "¡Éxito!",
        description: "Documento actualizado correctamente",
      });

      await loadDocuments();
      return data;
    } catch (err) {
      console.error('Error in updateDocument:', err);
      toast({
        title: "Error",
        description: "No se pudo actualizar el documento",
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      console.log('Deleting knowledge base document:', documentId);

      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', documentId);

      if (error) {
        console.error('Error deleting knowledge base document:', error);
        throw error;
      }

      console.log('Knowledge base document deleted successfully');

      toast({
        title: "¡Éxito!",
        description: "Documento eliminado correctamente",
      });

      await loadDocuments();
    } catch (err) {
      console.error('Error in deleteDocument:', err);
      toast({
        title: "Error",
        description: "No se pudo eliminar el documento",
        variant: "destructive",
      });
      throw err;
    }
  };

  return {
    documents,
    loading,
    error,
    loadDocuments,
    createDocument,
    updateDocument,
    deleteDocument
  };
};
