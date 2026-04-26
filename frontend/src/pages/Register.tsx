import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { FaMoneyBillWave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../api';

const schema = yup.object({
  name: yup.string().required('Campo obrigatório'),
  email: yup.string().email('E-mail inválido').required('Campo obrigatório'),
  password: yup.string().min(6, 'Mínimo 6 caracteres').required('Campo obrigatório'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Senhas não conferem')
    .required('Campo obrigatório'),
}).required();

type FormData = yup.InferType<typeof schema>;

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await api.post('/users', {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      toast.success('Usuário cadastrado com sucesso!');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao cadastrar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="bg-slate-900 p-5 rounded-2xl shadow-2xl mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
          {React.createElement(FaMoneyBillWave as any, { className: "text-white text-5xl" })}
        </div>
        <h2 className="text-center text-4xl font-black text-slate-900 tracking-tight uppercase">
          Controle financeiro
        </h2>
        <p className="mt-2 text-center text-slate-500 font-medium uppercase tracking-[0.2em] text-xs">
          Registro de Novo Usuário
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-900 py-10 px-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] sm:rounded-[2.5rem] sm:px-12 border border-slate-800">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">
                Nome Completo
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  type="text"
                  {...register('name')}
                  className={`appearance-none block w-full px-5 py-4 border rounded-2xl shadow-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent sm:text-sm transition-all duration-300 ${errors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-800 bg-slate-950 text-white'
                    }`}
                  placeholder="Nome do Diretor / Gestor"
                />
                {errors.name && (
                  <p className="mt-2 text-xs text-red-500 font-medium ml-1">{errors.name.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">
                E-mail Corporativo
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className={`appearance-none block w-full px-5 py-4 border rounded-2xl shadow-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent sm:text-sm transition-all duration-300 ${errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-800 bg-slate-950 text-white'
                    }`}
                  placeholder="seu@trabalho.com"
                />
                {errors.email && (
                  <p className="mt-2 text-xs text-red-500 font-medium ml-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">
                Nova Chave de Acesso
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  {...register('password')}
                  className={`appearance-none block w-full px-5 py-4 border rounded-2xl shadow-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent sm:text-sm transition-all duration-300 ${errors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-800 bg-slate-950 text-white'
                    }`}
                  placeholder="******"
                />
                {errors.password && (
                  <p className="mt-2 text-xs text-red-500 font-medium ml-1">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">
                Confirmar Chave
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword')}
                  className={`appearance-none block w-full px-5 py-4 border rounded-2xl shadow-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent sm:text-sm transition-all duration-300 ${errors.confirmPassword ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-800 bg-slate-950 text-white'
                    }`}
                  placeholder="******"
                />
                {errors.confirmPassword && (
                  <p className="mt-2 text-xs text-red-500 font-medium ml-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-black text-slate-900 bg-white hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 transition-all duration-300 active:scale-[0.98]"
              >
                {loading ? 'PROCESSANDO...' : 'FINALIZAR CREDENCIAMENTO'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="text-slate-400 hover:text-white font-bold text-sm underline underline-offset-8 decoration-slate-700 hover:decoration-white transition-all"
            >
              Já possui credenciais? Retornar ao Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
