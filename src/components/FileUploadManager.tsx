import React, { useEffect, useCallback } from 'react';
import { Upload, File, Trash2, AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const FileUploadManager = () => {
  const { files, loading, uploading, loadFiles, uploadFile, deleteFile } = useFileUpload();
  const { toast } = useToast();

  useEffect(() => {
    loadFiles();
  }, []);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'text/plain',
      'application/json'
    ];

    for (const file of Array.from(selectedFiles)) {
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de archivo no soportado",
          description: `El archivo ${file.name} no es compatible. Tipos permitidos: PDF, DOC, XLSX, CSV, TXT, JSON`,
          variant: "destructive",
        });
        continue;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "Archivo muy grande",
          description: `El archivo ${file.name} supera el límite de 10MB`,
          variant: "destructive",
        });
        continue;
      }

      try {
        console.log('Processing file with AI extraction:', file.name);
        
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

        // Primero cargar el archivo básico
        const uploadedFile = await uploadFile(file);
        
        if (uploadedFile) {
          // Después procesarlo con IA para extracción real
          console.log('Extracting content with AI for file:', file.name);
          
          try {
            toast({
              title: "Procesando documento",
              description: `Extrayendo contenido de ${file.name} con IA...`,
            });
            
            const { data: extractionData, error: extractionError } = await supabase.functions.invoke('extract-document-content', {
              body: {
                fileContent: base64Content,
                fileName: file.name,
                fileType: file.type
              }
            });

            if (extractionError) {
              console.error('Error in document extraction:', extractionError);
              throw new Error(extractionError.message || 'Error en extracción de documento');
            }

            console.log('Document extraction completed:', extractionData);

            // Actualizar el archivo con el contenido extraído
            const { error: updateError } = await supabase
              .from('uploaded_files')
              .update({
                content_extracted: extractionData.extractedContent,
                processing_status: extractionData.status || 'completed',
                updated_at: new Date().toISOString()
              })
              .eq('id', uploadedFile.id);

            if (updateError) {
              console.error('Error updating file:', updateError);
            }

            // Crear entrada mejorada en knowledge_base
            const { error: kbError } = await supabase
              .from('knowledge_base')
              .insert({
                title: extractionData.fileName,
                content: extractionData.extractedContent,
                document_type: 'uploaded_file',
                tags: [extractionData.documentType, 'archivo'],
                ai_summary: extractionData.aiSummary,
                key_points: extractionData.keyPoints,
                file_id: uploadedFile.id,
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
            } else {
              toast({
                title: "¡Extracción completada!",
                description: `${file.name} procesado con IA y agregado a la base de conocimientos`,
              });
            }

          } catch (extractionError) {
            console.error('Error in AI extraction:', extractionError);
            
            // Actualizar estado a error
            await supabase
              .from('uploaded_files')
              .update({
                processing_status: 'error',
                updated_at: new Date().toISOString()
              })
              .eq('id', uploadedFile.id);
              
            toast({
              title: "Error en extracción",
              description: extractionError instanceof Error ? extractionError.message : "Error al procesar el documento",
              variant: "destructive",
            });
          }
        }

      } catch (error) {
        console.error('Error uploading file:', file.name, error);
        toast({
          title: "Error",
          description: `Error al cargar ${file.name}: ${error instanceof Error ? error.message : 'Error desconocido'}`,
          variant: "destructive",
        });
      }
    }

    // Reset input
    event.target.value = '';
    
    // Recargar lista de archivos
    setTimeout(() => {
      loadFiles();
    }, 1000);
  }, [uploadFile, toast, loadFiles]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const getFileTypeColor = (fileType: string) => {
    if (fileType.includes('pdf')) return 'bg-red-100 text-red-700';
    if (fileType.includes('word') || fileType.includes('document')) return 'bg-blue-100 text-blue-700';
    if (fileType.includes('excel') || fileType.includes('sheet')) return 'bg-green-100 text-green-700';
    if (fileType.includes('csv')) return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-700';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const retryProcessing = async (fileId: string, fileName: string, fileType: string) => {
    try {
      toast({
        title: "Reintentando procesamiento",
        description: `Procesando ${fileName} nuevamente...`,
      });
      
      // Actualizar estado a procesando
      await supabase
        .from('uploaded_files')
        .update({
          processing_status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId);
      
      // Obtener el contenido del archivo
      const { data: fileData } = await supabase
        .from('uploaded_files')
        .select('*')
        .eq('id', fileId)
        .single();
      
      if (!fileData) {
        throw new Error('Archivo no encontrado');
      }
      
      // Reintentar extracción
      const { data: extractionData, error: extractionError } = await supabase.functions.invoke('extract-document-content', {
        body: {
          fileContent: '', // No tenemos el contenido original, pero la función puede intentar extraer de nuevo
          fileName: fileName,
          fileType: fileType,
          fileId: fileId
        }
      });
      
      if (extractionError) {
        throw new Error(extractionError.message);
      }
      
      // Actualizar con el resultado
      await supabase
        .from('uploaded_files')
        .update({
          content_extracted: extractionData.extractedContent,
          processing_status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId);
      
      toast({
        title: "Procesamiento completado",
        description: `${fileName} procesado correctamente`,
      });
      
      loadFiles();
    } catch (error) {
      console.error('Error retrying processing:', error);
      toast({
        title: "Error",
        description: `No se pudo reprocesar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Gestor de Archivos</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">Cargar Documentos</p>
          <p className="text-sm text-gray-600 mb-4">
            Soporta: PDF, DOC, DOCX, XLS, XLSX, CSV, TXT, JSON (máx. 10MB)
          </p>
          <Input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.json"
            onChange={handleFileUpload}
            disabled={uploading}
            className="mb-4"
          />
          {uploading && (
            <p className="text-sm text-blue-600">Cargando y procesando archivo(s) con IA...</p>
          )}
          
          <div className="text-sm text-gray-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mt-4">
            <p className="mb-2 font-medium">✅ Extracción Avanzada con IA:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Procesamiento OCR para PDFs con texto en imágenes</li>
              <li>Análisis inteligente del contenido con GPT-4</li>
              <li>Generación automática de resúmenes y puntos clave</li>
              <li>Identificación de información comercial relevante</li>
            </ul>
          </div>
        </div>

        {/* Files List */}
        <div className="space-y-3">
          <h3 className="font-medium">Archivos Cargados ({files.length})</h3>
          
          {loading ? (
            <p className="text-center py-4">Cargando archivos...</p>
          ) : files.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              No hay archivos cargados
            </p>
          ) : (
            files.map((file) => (
              <Card key={file.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {getStatusIcon(file.processing_status)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.filename}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getFileTypeColor(file.file_type)}>
                          {file.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatFileSize(file.file_size)}
                        </span>
                        <Badge variant={
                          file.processing_status === 'completed' ? 'default' :
                          file.processing_status === 'pending' ? 'secondary' : 
                          file.processing_status === 'processing' ? 'outline' : 'destructive'
                        }>
                          {file.processing_status === 'completed' ? '✅ Procesado con IA' :
                           file.processing_status === 'pending' ? 'Pendiente' : 
                           file.processing_status === 'processing' ? 'Procesando...' : 'Error'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {file.processing_status === 'error' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => retryProcessing(file.id, file.filename, file.file_type)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Loader2 className="h-4 w-4 mr-1" />
                        Reintentar
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteFile(file.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {file.content_extracted && file.processing_status === 'completed' && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                    <p className="font-medium mb-1">✅ Contenido extraído con IA:</p>
                    <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
                      {file.content_extracted.substring(0, 200)}...
                    </p>
                  </div>
                )}
                
                {file.processing_status === 'error' && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded text-sm">
                    <p className="font-medium mb-1 text-red-700 dark:text-red-400">❌ Error en el procesamiento:</p>
                    <p className="text-red-600 dark:text-red-300">
                      No se pudo extraer el contenido del documento. Intente con otro formato o reintentar el procesamiento.
                    </p>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploadManager;