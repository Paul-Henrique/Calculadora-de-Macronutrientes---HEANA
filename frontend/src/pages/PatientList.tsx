import React, { useEffect, useState, useCallback } from 'react';
import { getPatients, createPatient, deletePatient, updatePatient } from '../services/api';
import { Patient, PatientCreate } from '../types';
import { usePatient } from '../contexts/PatientContext';
import { UserPlus, Search, Edit2, Trash2, CheckCircle, XCircle, User, Loader2, AlertCircle } from 'lucide-react';
import { z } from 'zod';

const PatientSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido (000.000.000-00)').optional().or(z.literal('')),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida').optional().or(z.literal('')),
  sex: z.enum(['M', 'F']),
});

const PatientList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { selectedPatient, selectPatient } = usePatient();

  const [formData, setFormData] = useState<PatientCreate>({
    name: '',
    cpf: '',
    birth_date: '',
    sex: 'M'
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      console.log('[PatientList] Buscando pacientes...');
      const data = await getPatients();
      setPatients(data);
    } catch (error) {
      console.error('[PatientList] Erro ao buscar pacientes:', error);
      setErrorMsg('Erro ao carregar lista de pacientes. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const validateForm = () => {
    try {
      PatientSchema.parse(formData);
      setFormErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) errors[e.path[0] as string] = e.message;
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setErrorMsg(null);
    try {
      console.log('[PatientList] Salvando paciente:', formData);
      if (editingPatient) {
        const updated = await updatePatient(editingPatient.id, formData);
        console.log('[PatientList] Paciente atualizado:', updated);
      } else {
        const created = await createPatient(formData);
        console.log('[PatientList] Paciente criado:', created);
      }
      setIsModalOpen(false);
      setEditingPatient(null);
      setFormData({ name: '', cpf: '', birth_date: '', sex: 'M' });
      fetchPatients();
    } catch (error: any) {
      console.error('[PatientList] Erro ao salvar:', error);
      const detail = error.response?.data?.detail || 'Erro ao salvar paciente';
      setErrorMsg(typeof detail === 'string' ? detail : JSON.stringify(detail));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este paciente?')) {
      try {
        await deletePatient(id);
        if (selectedPatient?.id === id) selectPatient(null);
        fetchPatients();
      } catch (error) {
        alert('Erro ao excluir paciente');
      }
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.cpf?.includes(searchTerm)
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Pacientes</h1>
          <p className="text-gray-600">Cadastre e selecione o paciente para atendimento</p>
        </div>
        <button 
          onClick={() => {
            setEditingPatient(null);
            setFormData({ name: '', cpf: '', birth_date: '', sex: 'M' });
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          <span>Novo Paciente</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Pesquisar por nome ou CPF..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Nome</th>
                <th className="px-6 py-4 font-semibold">CPF</th>
                <th className="px-6 py-4 font-semibold">Nascimento</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Carregando pacientes...</td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Nenhum paciente encontrado.</td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr 
                    key={patient.id} 
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedPatient?.id === patient.id ? 'bg-indigo-50/50' : ''}`}
                    onClick={() => selectPatient(patient)}
                  >
                    <td className="px-6 py-4">
                      {selectedPatient?.id === patient.id ? (
                        <div className="flex items-center text-green-600 text-xs font-bold uppercase tracking-wider">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Ativo
                        </div>
                      ) : (
                        <div className="text-gray-400 text-xs uppercase tracking-wider">Inativo</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-gray-900">{patient.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{patient.cpf || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {patient.birth_date ? new Date(patient.birth_date).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => {
                            setEditingPatient(patient);
                            setFormData({
                              name: patient.name,
                              cpf: patient.cpf || '',
                              birth_date: patient.birth_date || '',
                              sex: (patient.sex as 'M' | 'F') || 'M'
                            });
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(patient.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPatient ? 'Editar Paciente' : 'Novo Paciente'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateOrUpdate} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg flex items-center text-sm">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className={`w-full px-4 py-2 rounded-lg border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-500 outline-none`}
                />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                  <input 
                    type="text" 
                    value={formData.cpf}
                    onChange={e => setFormData({...formData, cpf: e.target.value})}
                    placeholder="000.000.000-00"
                    className={`w-full px-4 py-2 rounded-lg border ${formErrors.cpf ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-500 outline-none`}
                  />
                  {formErrors.cpf && <p className="text-red-500 text-xs mt-1">{formErrors.cpf}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                  <select 
                    value={formData.sex}
                    onChange={e => setFormData({...formData, sex: e.target.value as 'M' | 'F'})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                <input 
                  type="date" 
                  value={formData.birth_date}
                  onChange={e => setFormData({...formData, birth_date: e.target.value})}
                  className={`w-full px-4 py-2 rounded-lg border ${formErrors.birth_date ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-500 outline-none`}
                />
                {formErrors.birth_date && <p className="text-red-500 text-xs mt-1">{formErrors.birth_date}</p>}
              </div>
              <div className="pt-4 flex space-x-3">
                <button 
                  type="button"
                  disabled={saving}
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingPatient ? 'Atualizar' : 'Salvar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;
