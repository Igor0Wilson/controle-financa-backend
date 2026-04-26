import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import api from '../api';
import { FaTimes, FaEye, FaEyeSlash, FaUserCircle } from 'react-icons/fa';

const schema = yup.object().shape({
  name: yup.string().required('Obrigatório'),
  email: yup.string().email('E-mail inválido').required('Obrigatório'),
  password: yup.string().min(6, 'Mínimo 6 caracteres').optional(),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), undefined], 'Senhas não conferem')
    .optional(),
});

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: { name: string, email: string };
  onSuccess: () => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ isOpen, onClose, userData, onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: userData.name,
      email: userData.email,
    }
  });

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      const payload = { ...data };
      delete payload.confirmPassword;
      if (!payload.password) delete payload.password;

      await api.patch('/users/me', payload);
      toast.success('Perfil atualizado com sucesso!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
        <div className="bg-slate-900 p-8 flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10 flex items-center space-x-4">
            <div className="bg-white/10 p-3 rounded-2xl">
              {React.createElement(FaUserCircle as any, { className: "text-white text-3xl" })}
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Editar Perfil</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Configurações de Acesso</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors relative z-10 p-2">
            {React.createElement(FaTimes as any, { className: "text-xl" })}
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome Completo</label>
              <input 
                {...register('name')}
                className={`w-full bg-slate-50 border-2 rounded-2xl py-4 px-6 text-slate-900 font-bold focus:outline-none transition-all ${errors.name ? 'border-red-500' : 'border-slate-100 focus:border-slate-900'}`}
              />
              {errors.name && <p className="mt-2 text-xs text-red-500 font-bold ml-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">E-mail de Acesso</label>
              <input 
                {...register('email')}
                className={`w-full bg-slate-50 border-2 rounded-2xl py-4 px-6 text-slate-900 font-bold focus:outline-none transition-all ${errors.email ? 'border-red-500' : 'border-slate-100 focus:border-slate-900'}`}
              />
              {errors.email && <p className="mt-2 text-xs text-red-500 font-bold ml-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nova Senha (opcional)</label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className={`w-full bg-slate-50 border-2 rounded-2xl py-4 px-6 text-slate-900 font-bold focus:outline-none transition-all ${errors.password ? 'border-red-500' : 'border-slate-100 focus:border-slate-900'}`}
                    placeholder="******"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    {React.createElement(showPassword ? FaEyeSlash : FaEye as any)}
                  </button>
                </div>
                {errors.password && <p className="mt-2 text-xs text-red-500 font-bold ml-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Confirmar Senha</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    className={`w-full bg-slate-50 border-2 rounded-2xl py-4 px-6 text-slate-900 font-bold focus:outline-none transition-all ${errors.confirmPassword ? 'border-red-500' : 'border-slate-100 focus:border-slate-900'}`}
                    placeholder="******"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    {React.createElement(showConfirmPassword ? FaEyeSlash : FaEye as any)}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-2 text-xs text-red-500 font-bold ml-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-sm font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 bg-slate-900 text-white py-4 rounded-2xl text-sm font-black hover:bg-slate-800 transition-all shadow-xl active:scale-95 disabled:opacity-50 uppercase tracking-widest"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;
