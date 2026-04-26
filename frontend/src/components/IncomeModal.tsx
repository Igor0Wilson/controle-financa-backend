import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaTimes, FaHandHoldingUsd } from 'react-icons/fa';
import api from '../api';
import { toast } from 'react-toastify';

const schema = yup.object({
  name: yup.string().required('Fonte é obrigatória'),
  value: yup.number().typeError('Deve ser um número').positive('Valor deve ser positivo').required('Obrigatório'),
  incomeDate: yup.string().required('Data é obrigatória'),
  isRecurring: yup.boolean(),
}).required();

type FormData = yup.InferType<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

const IncomeModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      isRecurring: false,
    }
  });

  const isRecurring = watch('isRecurring');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          value: initialData.value,
          incomeDate: initialData.incomeDate,
          isRecurring: initialData.isRecurring,
        });
      } else {
        reset({
          isRecurring: false,
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      if (initialData) {
        await api.patch(`/income/${initialData.id}`, data);
        toast.success('Renda atualizada com sucesso!');
      } else {
        await api.post('/income', data);
        toast.success('Renda cadastrada com sucesso!');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao processar requisição');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 transform transition-all">
        <div className="px-8 py-6 bg-slate-900 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-white/10 p-2 rounded-lg">
              {React.createElement(FaHandHoldingUsd as any, { className: "text-white text-xl" })}
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">
              {initialData ? 'Editar Receita' : 'Novo Crédito'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
            {React.createElement(FaTimes as any)}
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Fonte da Receita</label>
              <input
                type="text"
                {...register('name')}
                className={`w-full px-5 py-4 rounded-2xl border-2 transition-all outline-none text-slate-800 font-medium ${errors.name ? 'border-red-100 bg-red-50 focus:border-red-300' : 'border-slate-100 bg-slate-50 focus:border-slate-900'}`}
                placeholder="Ex: Salário Mensal / Dividendos"
              />
              {errors.name && <p className="mt-2 text-xs text-red-500 font-bold ml-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Valor do Crédito (R$)</label>
              <input
                type="number"
                step="0.01"
                {...register('value')}
                className={`w-full px-5 py-4 rounded-2xl border-2 transition-all outline-none text-slate-800 font-black ${errors.value ? 'border-red-100 bg-red-50 focus:border-red-300' : 'border-slate-100 bg-slate-50 focus:border-slate-900'}`}
                placeholder="0,00"
              />
              {errors.value && <p className="mt-2 text-xs text-red-500 font-bold ml-1">{errors.value.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Data de Recebimento</label>
              <input
                type="date"
                {...register('incomeDate')}
                className={`w-full px-5 py-4 rounded-2xl border-2 transition-all outline-none text-slate-800 font-medium ${errors.incomeDate ? 'border-red-100 bg-red-50 focus:border-red-300' : 'border-slate-100 bg-slate-50 focus:border-slate-900'}`}
              />
              {errors.incomeDate && <p className="mt-2 text-xs text-red-500 font-bold ml-1">{errors.incomeDate.message}</p>}
            </div>

            <div className="md:col-span-2 pt-2">
              <label className="group flex items-center cursor-pointer">
                <div className="relative">
                  <input type="checkbox" {...register('isRecurring')} className="sr-only" />
                  <div className={`w-12 h-6 rounded-full transition-colors ${isRecurring ? 'bg-slate-900' : 'bg-slate-200'}`}></div>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isRecurring ? 'translate-x-6' : ''}`}></div>
                </div>
                <span className="ml-3 text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Receita Recorrente (Mensal)</span>
              </label>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Processando...' : initialData ? 'Salvar Alterações' : 'Registrar Receita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncomeModal;
