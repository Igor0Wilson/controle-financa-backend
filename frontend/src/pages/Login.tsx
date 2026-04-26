import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { FaMoneyBillWave, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const schema = yup.object({
  email: yup.string().email('E-mail inválido').required('Campo obrigatório'),
  password: yup.string().min(6, 'Mínimo 6 caracteres').required('Campo obrigatório'),
}).required();

type FormData = yup.InferType<typeof schema>;

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', data);
      const { access_token, user } = response.data;
      login(access_token, user);
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao realizar login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="bg-slate-900 p-5 rounded-2xl shadow-2xl mb-6 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
          {React.createElement(FaMoneyBillWave as any, { className: "text-white text-5xl" })}
        </div>
        <h2 className="text-center text-4xl font-black text-slate-900 tracking-tight uppercase">
          Controle financeiro
        </h2>
        <p className="mt-2 text-center text-slate-500 font-medium uppercase tracking-[0.2em] text-xs">
          Gestão Patrimonial Inteligente
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-900 py-10 px-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] sm:rounded-[2.5rem] sm:px-12 border border-slate-800">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">
                Identificação / E-mail
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className={`appearance-none block w-full px-5 py-4 border rounded-2xl shadow-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent sm:text-sm transition-all duration-300 ${errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-800 bg-slate-950 text-white'
                    }`}
                  placeholder="exemplo@executivo.com"
                />
                {errors.email && (
                  <p className="mt-2 text-xs text-red-500 font-medium ml-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">
                Chave de Acesso
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`appearance-none block w-full px-5 py-4 border rounded-2xl shadow-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent sm:text-sm transition-all duration-300 ${errors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-800 bg-slate-950 text-white'
                    }`}
                  placeholder="******"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? React.createElement(FaEyeSlash as any) : React.createElement(FaEye as any)}
                </button>
                {errors.password && (
                  <p className="mt-2 text-xs text-red-500 font-medium ml-1">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-black text-slate-900 bg-white hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 transition-all duration-300 active:scale-[0.98]"
              >
                {loading ? 'AUTENTICANDO...' : 'ENTRAR NO SISTEMA'}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-slate-900 text-slate-500 font-bold uppercase tracking-widest">Acesso Restrito</span>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                to="/register"
                className="text-slate-400 hover:text-white font-bold text-sm underline underline-offset-8 decoration-slate-700 hover:decoration-white transition-all"
              >
                Solicitar nova conta de acesso
              </Link>
            </div>
          </div>
        </div>
        <p className="mt-10 text-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
          &copy; 2026 Controle financeiro Systems
        </p>
      </div>
    </div>
  );
};

export default Login;
