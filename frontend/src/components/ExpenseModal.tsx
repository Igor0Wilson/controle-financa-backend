import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaTimes, FaMoneyBillWave } from 'react-icons/fa';
import api from '../api';
import { toast } from 'react-toastify';
import CustomSelect from './CustomSelect';

interface AccountType {
  id: string;
  name: string;
}

const schema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  accountTypeId: yup.string().required('Selecione um tipo'),
  value: yup.number().typeError('Deve ser um número').positive('Valor deve ser positivo').required('Obrigatório'),
  dueDate: yup.string().required('Data é obrigatória'),
  isRecurring: yup.boolean(),
  isInstallment: yup.boolean(),
  installmentCount: yup.number().when('isInstallment', {
    is: true,
    then: (schema) => schema.min(2, 'Mínimo 2').required('Obrigatório'),
    otherwise: (schema) => schema.nullable().transform(v => v || null),
  }),
  isPaid: yup.boolean(),
}).required();

type FormData = yup.InferType<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

const ExpenseModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, reset, control, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      isRecurring: false,
      isInstallment: false,
      isPaid: false,
    }
  });

  const isRecurring = watch('isRecurring');
  const isInstallment = watch('isInstallment');

  useEffect(() => {
    if (isOpen) {
      api.get('/account-types').then(response => {
        setAccountTypes(response.data);
      }).catch(() => {
        toast.error('Erro ao carregar tipos de conta');
      });

      if (initialData) {
        reset({
          name: initialData.name,
          accountTypeId: initialData.accountTypeId,
          value: initialData.value,
          dueDate: initialData.dueDate,
          isRecurring: initialData.isRecurring,
          isInstallment: initialData.isInstallment,
          installmentCount: initialData.installmentCount,
          isPaid: initialData.isPaid,
        });
      } else {
        reset({
          isRecurring: false,
          isInstallment: false,
          isPaid: false,
          accountTypeId: '',
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      
      const payload = { ...data };
      if (!payload.isInstallment) {
        delete payload.installmentCount;
      }
      if (payload.isRecurring) {
        payload.isPaid = false;
      }

      if (initialData) {
        await api.patch(`/expenses/${initialData.id}`, payload);
        toast.success('Despesa atualizada!');
      } else {
        await api.post('/expenses', payload);
        toast.success('Despesa cadastrada!');
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
              {React.createElement(FaMoneyBillWave as any, { className: "text-white text-xl" })}
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">
              {initialData ? 'Editar Lançamento' : 'Novo Lançamento'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
            {React.createElement(FaTimes as any)}
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Descrição da Despesa</label>
              <input
                type="text"
                {...register('name')}
                className={`w-full px-5 py-4 rounded-2xl border-2 transition-all outline-none text-slate-800 font-medium ${errors.name ? 'border-red-100 bg-red-50 focus:border-red-300' : 'border-slate-100 bg-slate-50 focus:border-slate-900'}`}
                placeholder="Ex: Consultoria Legislativa"
              />
              {errors.name && <p className="mt-2 text-xs text-red-500 font-bold ml-1">{errors.name.message}</p>}
            </div>

            <Controller
              name="accountTypeId"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  label="Categoria / Tipo"
                  options={accountTypes}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.accountTypeId?.message}
                />
              )}
            />

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Valor Nominal (R$)</label>
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
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Vencimento</label>
              <input
                type="date"
                {...register('dueDate')}
                className={`w-full px-5 py-4 rounded-2xl border-2 transition-all outline-none text-slate-800 font-medium ${errors.dueDate ? 'border-red-100 bg-red-50 focus:border-red-300' : 'border-slate-100 bg-slate-50 focus:border-slate-900'}`}
              />
              {errors.dueDate && <p className="mt-2 text-xs text-red-500 font-bold ml-1">{errors.dueDate.message}</p>}
            </div>

            <div className="flex flex-col space-y-4 pt-2">
              <label className="group flex items-center cursor-pointer">
                <div className="relative">
                  <input type="checkbox" {...register('isRecurring')} className="sr-only" />
                  <div className={`w-12 h-6 rounded-full transition-colors ${isRecurring ? 'bg-slate-900' : 'bg-slate-200'}`}></div>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isRecurring ? 'translate-x-6' : ''}`}></div>
                </div>
                <span className="ml-3 text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Despesa Mensal (Fixa)</span>
              </label>

              {!isRecurring && (
                <label className="group flex items-center cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" {...register('isPaid')} className="sr-only" />
                    <div className={`w-12 h-6 rounded-full transition-colors ${watch('isPaid') ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${watch('isPaid') ? 'translate-x-6' : ''}`}></div>
                  </div>
                  <span className="ml-3 text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Já Liquidada</span>
                </label>
              )}
            </div>
          </div>

          {!isRecurring && !initialData && (
            <div className="border-t border-slate-100 pt-6">
              <label className="group flex items-center cursor-pointer mb-4">
                <div className="relative">
                  <input type="checkbox" {...register('isInstallment')} className="sr-only" />
                  <div className={`w-12 h-6 rounded-full transition-colors ${isInstallment ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isInstallment ? 'translate-x-6' : ''}`}></div>
                </div>
                <span className="ml-3 text-sm font-bold text-slate-700">Parcelamento no Cartão</span>
              </label>

              {isInstallment && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Número de Parcelas</label>
                  <input
                    type="number"
                    {...register('installmentCount')}
                    className={`w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 outline-none focus:border-indigo-600 text-slate-800 font-bold transition-all ${errors.installmentCount ? 'border-red-200 bg-red-50' : ''}`}
                    placeholder="2"
                  />
                  {errors.installmentCount && <p className="mt-2 text-xs text-red-500 font-bold ml-1">{errors.installmentCount.message}</p>}
                </div>
              )}
            </div>
          )}

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Processando...' : initialData ? 'Salvar Alterações' : 'Confirmar Lançamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
