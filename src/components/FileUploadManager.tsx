
import React, { useEffect, useCallback } from 'react';
import { Upload, File, Trash2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';

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
        await uploadFile(file);
      } catch (error) {
        console.error('Error uploading file:', file.name, error);
      }
    }

    // Reset input
    event.target.value = '';
  }, [uploadFile, toast]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
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
            <p className="text-sm text-blue-600">Cargando archivo(s)...</p>
          )}
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
                          file.processing_status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {file.processing_status === 'completed' ? 'Procesado' :
                           file.processing_status === 'pending' ? 'Pendiente' : 'Error'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteFile(file.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                {file.content_extracted && file.processing_status === 'completed' && (
                  <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                    <p className="font-medium mb-1">Contenido extraído:</p>
                    <p className="text-gray-700 line-clamp-3">
                      {file.content_extracted.substring(0, 200)}...
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
