
import React, { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, Eye, Download, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  uploadDate: Date;
  lastModified: Date;
  size: number;
  type: 'text' | 'document' | 'manual';
}

const CATEGORIES = [
  'Productos y Servicios',
  'Políticas de Empresa',
  'Procesos de Venta',
  'Objeciones Comunes',
  'Precios y Promociones',
  'Competencia',
  'Protocolos de Atención',
  'Documentación Técnica',
  'Materiales de Capacitación',
  'Otros'
];

const KnowledgeManager = () => {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [isAddingDocument, setIsAddingDocument] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<KnowledgeDocument | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newDocument, setNewDocument] = useState({
    title: '',
    content: '',
    category: 'Productos y Servicios',
    tags: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    const savedDocs = localStorage.getItem('knowledgeDocuments');
    if (savedDocs) {
      const parsedDocs = JSON.parse(savedDocs).map((doc: any) => ({
        ...doc,
        uploadDate: new Date(doc.uploadDate),
        lastModified: new Date(doc.lastModified),
      }));
      setDocuments(parsedDocs);
    }
  };

  const saveDocuments = (docs: KnowledgeDocument[]) => {
    localStorage.setItem('knowledgeDocuments', JSON.stringify(docs));
    setDocuments(docs);
  };

  const handleAddDocument = () => {
    if (!newDocument.title.trim() || !newDocument.content.trim()) {
      toast({
        title: "Error",
        description: "El título y contenido son obligatorios.",
        variant: "destructive",
      });
      return;
    }

    const document: KnowledgeDocument = {
      id: Date.now().toString(),
      title: newDocument.title,
      content: newDocument.content,
      category: newDocument.category,
      tags: newDocument.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      uploadDate: new Date(),
      lastModified: new Date(),
      size: new Blob([newDocument.content]).size,
      type: 'text',
    };

    const updatedDocs = [...documents, document];
    saveDocuments(updatedDocs);

    setNewDocument({ title: '', content: '', category: 'Productos y Servicios', tags: '' });
    setIsAddingDocument(false);

    toast({
      title: "Documento agregado",
      description: "El documento se ha guardado en la base de conocimiento.",
    });
  };

  const handleDeleteDocument = (id: string) => {
    const updatedDocs = documents.filter(doc => doc.id !== id);
    saveDocuments(updatedDocs);
    
    toast({
      title: "Documento eliminado",
      description: "El documento se ha eliminado de la base de conocimiento.",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const document: KnowledgeDocument = {
        id: Date.now().toString(),
        title: file.name,
        content: content,
        category: 'Documentación Técnica',
        tags: ['archivo', 'subido'],
        uploadDate: new Date(),
        lastModified: new Date(),
        size: file.size,
        type: 'document',
      };

      const updatedDocs = [...documents, document];
      saveDocuments(updatedDocs);

      toast({
        title: "Archivo subido",
        description: `${file.name} se ha agregado a la base de conocimiento.`,
      });
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Gestión del Conocimiento</span>
            </div>
            <div className="flex space-x-2">
              <input
                type="file"
                accept=".txt,.md,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Subir Archivo
              </Button>
              <Button onClick={() => setIsAddingDocument(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Documento
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar en documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{documents.length}</div>
              <div className="text-sm text-gray-600">Total Documentos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{new Set(documents.map(d => d.category)).size}</div>
              <div className="text-sm text-gray-600">Categorías</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatFileSize(documents.reduce((total, doc) => total + doc.size, 0))}
              </div>
              <div className="text-sm text-gray-600">Tamaño Total</div>
            </div>
          </div>

          {/* Documents List */}
          <div className="space-y-3">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron documentos</p>
              </div>
            ) : (
              filteredDocuments.map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-purple-600" />
                          <div>
                            <h3 className="font-medium">{doc.title}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {doc.content.substring(0, 150)}...
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-3">
                          <Badge variant="outline">{doc.category}</Badge>
                          <span className="text-xs text-gray-500">
                            {formatFileSize(doc.size)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {doc.lastModified.toLocaleDateString()}
                          </span>
                          {doc.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedDocument(doc)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{doc.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="flex items-center space-x-4">
                                <Badge>{doc.category}</Badge>
                                <span className="text-sm text-gray-500">{formatFileSize(doc.size)}</span>
                                <span className="text-sm text-gray-500">
                                  Modificado: {doc.lastModified.toLocaleDateString()}
                                </span>
                              </div>
                              <div className="prose dark:prose-invert max-w-none">
                                <div className="whitespace-pre-wrap p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                  {doc.content}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Document Dialog */}
      <Dialog open={isAddingDocument} onOpenChange={setIsAddingDocument}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={newDocument.title}
                onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título del documento..."
              />
            </div>
            
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select 
                value={newDocument.category} 
                onValueChange={(value) => setNewDocument(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Etiquetas (separadas por comas)</Label>
              <Input
                value={newDocument.tags}
                onChange={(e) => setNewDocument(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="ventas, productos, objeciones..."
              />
            </div>

            <div className="space-y-2">
              <Label>Contenido</Label>
              <Textarea
                value={newDocument.content}
                onChange={(e) => setNewDocument(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Contenido del documento..."
                rows={10}
              />
            </div>

            <div className="flex space-x-2 justify-end">
              <Button variant="outline" onClick={() => setIsAddingDocument(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddDocument}>
                Guardar Documento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KnowledgeManager;
