import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import ExpenseModal from '../components/ExpenseModal';
import IncomeModal from '../components/IncomeModal';
import ConfirmationModal from '../components/ConfirmationModal';
import UserEditModal from '../components/UserEditModal';
import { toast } from 'react-toastify';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement,
  Title
} from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import { 
  FaPlus, 
  FaArrowUp, 
  FaArrowDown, 
  FaWallet, 
  FaSignOutAlt, 
  FaCheckCircle, 
  FaClock, 
  FaExclamationCircle,
  FaEdit,
  FaTrash,
  FaChartPie,
  FaChartLine,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement,
  Title
);

const Dashboard: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const [balance, setBalance] = useState({ balance: 0, totalIncome: 0, totalExpenses: 0, emergencyFund: 0 });
  const [expenses, setExpenses] = useState<any[]>([]);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [deleteConfig, setDeleteConfig] = useState<{ id: string, type: 'expense' | 'income' } | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [openInstallments, setOpenInstallments] = useState<string[]>([]);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyFundInput, setEmergencyFundInput] = useState('');
  const [isEmergencyLoading, setIsEmergencyLoading] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [balanceRes, expensesRes, incomesRes, chartsRes] = await Promise.all([
        api.get('/balance'),
        api.get('/expenses'),
        api.get('/income'),
        api.get('/balance/charts')
      ]);
      setBalance(balanceRes.data);
      setExpenses(expensesRes.data);
      setIncomes(incomesRes.data);
      setChartData(chartsRes.data);
    } catch (error) {
      toast.error('Erro ao carregar dados do dashboard');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePay = async (id: string) => {
    try {
      await api.patch(`/expenses/${id}/pay`);
      toast.success('Pagamento registrado!');
      fetchData();
    } catch (error) {
      toast.error('Erro ao registrar pagamento');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfig) return;
    try {
      setIsDeleteLoading(true);
      const endpoint = deleteConfig.type === 'expense' ? '/expenses' : '/income';
      await api.delete(`${endpoint}/${deleteConfig.id}`);
      toast.success('Registro removido com sucesso');
      setDeleteConfig(null);
      fetchData();
    } catch (error) {
      toast.error('Erro ao remover registro');
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleEmergencyFundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(emergencyFundInput);
    if (isNaN(amount) || amount < 0) {
      toast.error('Informe um valor válido');
      return;
    }

    // O patrimônio líquido ATUAL (exibido) já é descontado da reserva anterior.
    // O patrimônio BRUTO é (balance + emergencyFund).
    // O usuário não pode colocar uma reserva MAIOR que o patrimônio bruto total.
    const totalPatrimonioBruto = balance.balance + balance.emergencyFund;

    if (amount > totalPatrimonioBruto) {
      toast.error('A reserva não pode exceder o patrimônio total');
      return;
    }

    try {
      setIsEmergencyLoading(true);
      await api.post('/balance/emergency-fund', { amount });
      toast.success('Reserva de emergência atualizada!');
      setIsEmergencyModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Erro ao atualizar reserva');
    } finally {
      setIsEmergencyLoading(false);
    }
  };

  const handleEdit = (item: any, type: 'expense' | 'income') => {
    setEditingItem({ ...item, type });
    if (type === 'expense') setIsExpenseModalOpen(true);
    else setIsIncomeModalOpen(true);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pago':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-green-50 text-green-600 border border-green-100 uppercase tracking-tighter">{React.createElement(FaCheckCircle as any, { className: "mr-1" })} Liquidado</span>;
      case 'em_atraso':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-red-50 text-red-600 border border-red-100 uppercase tracking-tighter">{React.createElement(FaExclamationCircle as any, { className: "mr-1" })} Em Atraso</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-tighter">{React.createElement(FaClock as any, { className: "mr-1" })} Pendente</span>;
    }
  };

  const pieChartData = {
    labels: chartData?.expensesByCategory.map((c: any) => c.name) || [],
    datasets: [{
      data: chartData?.expensesByCategory.map((c: any) => c.value) || [],
      backgroundColor: [
        '#0f172a', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9'
      ],
      borderWidth: 0,
    }]
  };

  const lineChartData = {
    labels: chartData?.monthlyHistory.map((h: any) => h.month) || [],
    datasets: [
      {
        label: 'Receita',
        data: chartData?.monthlyHistory.map((h: any) => h.income) || [],
        borderColor: '#10b981',
        backgroundColor: '#10b981',
        tension: 0.4,
      },
      {
        label: 'Despesa',
        data: chartData?.monthlyHistory.map((h: any) => h.expenses) || [],
        borderColor: '#ef4444',
        backgroundColor: '#ef4444',
        tension: 0.4,
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <nav className="bg-slate-900 shadow-2xl px-4 py-4 sm:py-6 sm:px-12 sticky top-0 z-40 border-b border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="bg-white p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
              {React.createElement(FaWallet as any, { className: "text-slate-900 text-lg sm:text-xl" })}
            </div>
            <h1 className="text-white text-lg sm:text-2xl font-black tracking-tighter">Controle financeiro</h1>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-6">
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-slate-400 text-[8px] sm:text-[10px] font-black uppercase tracking-widest">Bem-vindo</p>
              <div className="flex items-center space-x-2">
                <p className="text-white text-xs sm:text-base font-bold truncate max-w-[100px] sm:max-w-none">{user?.name}</p>
                <button 
                  onClick={() => setIsUserModalOpen(true)}
                  className="text-slate-400 hover:text-white transition-colors"
                  title="Editar Perfil"
                >
                  {React.createElement(FaEdit as any, { className: "text-xs" })}
                </button>
              </div>
            </div>
            <button 
              onClick={() => setShowLogoutConfirm(true)} 
              className="bg-white/10 hover:bg-white/20 text-white p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-300 group"
              title="Encerrar Sessão"
            >
              {React.createElement(FaSignOutAlt as any, { className: "group-hover:translate-x-1 transition-transform text-sm sm:text-base" })}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-10 sm:px-12 flex-grow w-full">
        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-12">
          {/* Card 1: Patrimônio Líquido */}
          <div className="bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 text-white/5 text-7xl sm:text-9xl transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
              {React.createElement(FaWallet as any)}
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1 sm:mb-2">Disponibilidade Imediata</p>
            <h3 className="text-white text-2xl sm:text-4xl font-black tracking-tight">{formatCurrency(balance.balance)}</h3>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-2">Patrimônio Líquido</p>
          </div>

          {/* Card 2: Reserva de Emergência */}
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-xl border border-slate-100 group">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Segurança Financeira</p>
              <button 
                onClick={() => { setEmergencyFundInput(balance.emergencyFund.toString()); setIsEmergencyModalOpen(true); }}
                className="bg-slate-900 text-white p-2 sm:p-3 rounded-xl sm:rounded-2xl hover:bg-slate-800 transition-all active:scale-90 shadow-lg"
              >
                {React.createElement(FaPlus as any, { className: "text-xs sm:text-sm" })}
              </button>
            </div>
            <h3 className="text-slate-900 text-2xl sm:text-4xl font-black tracking-tight">{formatCurrency(balance.emergencyFund)}</h3>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Reserva de Emergência</p>
          </div>

          {/* Card 3: Saldo do Mês */}
          <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-xl border border-slate-100 group">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Fluxo Mensal Projetado</p>
              <div className="bg-slate-100 text-slate-900 p-2 sm:p-3 rounded-xl sm:rounded-2xl">
                {React.createElement(FaChartLine as any, { className: "text-sm sm:text-base" })}
              </div>
            </div>
            <h3 className="text-slate-900 text-2xl sm:text-4xl font-black tracking-tight">{formatCurrency(balance.totalIncome - balance.totalExpenses)}</h3>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Saldo do Mês</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-12">
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border border-slate-100">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-6 sm:mb-8">
              <div className="bg-slate-100 p-2 rounded-lg">
                {React.createElement(FaChartPie as any, { className: "text-slate-900 text-sm sm:text-base" })}
              </div>
              <h3 className="text-sm sm:text-lg font-black text-slate-900 uppercase tracking-tighter">Gastos por Categoria</h3>
            </div>
            <div className="h-48 sm:h-64 flex items-center justify-center">
              {chartData ? <Pie data={pieChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { size: 10, weight: 'bold' } } } } }} /> : <div className="text-slate-300 font-bold">Carregando...</div>}
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border border-slate-100">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-6 sm:mb-8">
              <div className="bg-slate-100 p-2 rounded-lg">
                {React.createElement(FaChartLine as any, { className: "text-slate-900 text-sm sm:text-base" })}
              </div>
              <h3 className="text-sm sm:text-lg font-black text-slate-900 uppercase tracking-tighter">Histórico Mensal</h3>
            </div>
            <div className="h-48 sm:h-64">
              {chartData ? <Line data={lineChartData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { font: { size: 10, weight: 'bold' } } }, x: { ticks: { font: { size: 10, weight: 'bold' } } } }, plugins: { legend: { labels: { boxWidth: 10, font: { size: 10, weight: 'bold' } } } } }} /> : <div className="text-slate-300 font-bold">Carregando...</div>}
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse lg:flex-row gap-8 sm:gap-10">
          {/* Expenses Section */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 bg-white p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-slate-100">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter">Contas & Despesas</h2>
                <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1">Gerenciamento de Saídas</p>
              </div>
              <button 
                onClick={() => { setEditingItem(null); setIsExpenseModalOpen(true); }}
                className="w-full sm:w-auto bg-slate-900 text-white px-5 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center hover:bg-slate-800 transition-all shadow-lg active:scale-95"
              >
                {React.createElement(FaPlus as any, { className: "mr-2" })} Nova Despesa
              </button>
            </div>

            <div className="space-y-4">
              {expenses.length === 0 ? (
                <div className="bg-white p-8 sm:p-12 rounded-[2rem] sm:rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs sm:text-sm">Nenhum passivo registrado</p>
                </div>
              ) : (
                (() => {
                  const processedParents = new Set<string>();
                  return expenses.map(expense => {
                    // Se for uma parcela que não é a principal, e o pai está na lista, pulamos (ela será renderizada dentro do pai)
                    if (expense.isInstallment && expense.parentExpenseId && expenses.some(e => e.id === expense.parentExpenseId)) {
                      return null;
                    }

                    // Se for a principal de um parcelamento
                    const isGroupHeader = expense.isInstallment && !expense.parentExpenseId;
                    const childInstallments = isGroupHeader ? expenses.filter(e => e.parentExpenseId === expense.id) : [];
                    const isAccordionOpen = openInstallments.includes(expense.id);

                    return (
                      <div key={expense.id} className="space-y-2">
                        <div className={`bg-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border-2 transition-all hover:shadow-xl group ${expense.status === 'em_atraso' ? 'border-red-100' : 'border-white'} ${isGroupHeader ? 'border-indigo-50 shadow-sm' : ''}`}>
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="flex-1 w-full">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h4 className="font-black text-slate-900 text-base sm:text-lg leading-tight">
                                  {isGroupHeader ? expense.name.split(' (')[0] : expense.name}
                                </h4>
                                {getStatusBadge(expense.status)}
                                {isGroupHeader && (
                                  <button 
                                    onClick={() => setOpenInstallments(prev => prev.includes(expense.id) ? prev.filter(id => id !== expense.id) : [...prev, expense.id])}
                                    className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center hover:bg-indigo-100 transition-colors"
                                  >
                                    {childInstallments.length + 1} Parcelas
                                    {React.createElement(isAccordionOpen ? FaChevronUp : FaChevronDown as any, { className: "ml-2" })}
                                  </button>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2 sm:gap-4 text-[9px] sm:text-xs font-bold text-slate-400 uppercase tracking-tighter">
                                <span className="bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">📅 {formatDate(expense.dueDate)}</span>
                                <span className="bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">📂 {expense.accountType?.name}</span>
                                {expense.isRecurring && <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg border border-indigo-100">Mensal</span>}
                                {expense.isInstallment && <span className="bg-purple-50 text-purple-600 px-2 py-1 rounded-lg border border-purple-100">{expense.installmentNumber}/{expense.installmentCount}</span>}
                              </div>
                            </div>
                            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto sm:ml-4 border-t sm:border-0 pt-4 sm:pt-0">
                              <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight sm:mb-3">{formatCurrency(expense.value)}</p>
                              <div className="flex space-x-2">
                                {!expense.isPaid && (
                                  <button 
                                    onClick={() => handlePay(expense.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg sm:rounded-xl transition-all shadow-lg active:scale-90 flex items-center space-x-2"
                                    title="Marcar como Pago"
                                  >
                                    {React.createElement(FaCheckCircle as any, { className: "text-xs sm:text-sm" })}
                                    <span className="text-[10px] font-black uppercase tracking-tighter hidden sm:inline">Liquidar</span>
                                  </button>
                                )}
                                {expense.isPaid && (
                                  <div className="bg-green-50 text-green-600 p-2 rounded-lg sm:rounded-xl border border-green-100 flex items-center">
                                    {React.createElement(FaCheckCircle as any, { className: "text-sm" })}
                                  </div>
                                )}
                                <button 
                                  onClick={() => handleEdit(expense, 'expense')}
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-lg sm:rounded-xl transition-all active:scale-90"
                                  title="Editar"
                                >
                                  {React.createElement(FaEdit as any, { className: "text-sm sm:text-base" })}
                                </button>
                                <button 
                                  onClick={() => setDeleteConfig({ id: expense.id, type: 'expense' })}
                                  className="bg-red-50 hover:bg-red-100 text-red-500 p-2 rounded-lg sm:rounded-xl transition-all active:scale-90"
                                  title="Excluir"
                                >
                                  {React.createElement(FaTrash as any, { className: "text-sm sm:text-base" })}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Accordion Content for Installments */}
                        {isAccordionOpen && childInstallments.map(child => (
                          <div key={child.id} className="ml-4 sm:ml-12 bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in slide-in-from-top-2 duration-200">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="bg-white px-2 py-1 rounded-md text-[10px] font-black text-slate-500 border border-slate-200">{child.installmentNumber}/{child.installmentCount}</span>
                                <p className="text-sm font-bold text-slate-700">{formatDate(child.dueDate)}</p>
                                {getStatusBadge(child.status)}
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 w-full sm:w-auto justify-between">
                              <p className="font-black text-slate-900">{formatCurrency(child.value)}</p>
                              <div className="flex space-x-1">
                                {!child.isPaid && (
                                  <button onClick={() => handlePay(child.id)} className="text-green-600 p-1.5 hover:bg-green-50 rounded-lg transition-colors">
                                    {React.createElement(FaCheckCircle as any)}
                                  </button>
                                )}
                                <button onClick={() => handleEdit(child, 'expense')} className="text-slate-400 p-1.5 hover:bg-white rounded-lg transition-colors">
                                  {React.createElement(FaEdit as any)}
                                </button>
                                <button onClick={() => setDeleteConfig({ id: child.id, type: 'expense' })} className="text-red-400 p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                                  {React.createElement(FaTrash as any)}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  });
                })()
              )}
            </div>
          </div>

          {/* Income Section */}
          <div className="lg:w-96">
            <div className="flex justify-between items-center mb-6 sm:mb-8 bg-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-slate-100">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tighter uppercase">Capital</h2>
              <button 
                onClick={() => { setEditingItem(null); setIsIncomeModalOpen(true); }}
                className="bg-green-600 text-white p-2.5 sm:p-3 rounded-xl sm:rounded-2xl hover:bg-green-700 transition-all shadow-lg active:scale-90"
              >
                {React.createElement(FaPlus as any, { className: "text-sm sm:text-base" })}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {incomes.length === 0 ? (
                <div className="bg-white p-8 rounded-[1.5rem] sm:rounded-[2rem] border-2 border-dashed border-slate-100 text-center sm:col-span-2 lg:col-span-1">
                  <p className="text-slate-400 font-bold uppercase text-[9px] sm:text-[10px] tracking-widest">Sem ativos registrados</p>
                </div>
              ) : (
                incomes.map(income => (
                  <div key={income.id} className="bg-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-50 hover:shadow-lg transition-all group">
                    <div className="flex justify-between items-center mb-2 sm:mb-3">
                      <div className="bg-green-50 text-green-600 p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
                        {React.createElement(FaArrowUp as any, { className: "text-xs sm:text-sm" })}
                      </div>
                      <div className="flex space-x-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(income, 'income')} className="p-1.5 text-slate-400 hover:text-slate-900">{React.createElement(FaEdit as any, { className: "text-[10px] sm:text-xs" })}</button>
                        <button onClick={() => setDeleteConfig({ id: income.id, type: 'income' })} className="p-1.5 text-slate-400 hover:text-red-500">{React.createElement(FaTrash as any, { className: "text-[10px] sm:text-xs" })}</button>
                      </div>
                    </div>
                    <h4 className="font-black text-slate-800 text-xs sm:text-sm uppercase tracking-tight mb-1 truncate">{income.name}</h4>
                    <p className="text-base sm:text-lg font-black text-slate-900 mb-2">{formatCurrency(income.value)}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatDate(income.incomeDate)}</span>
                      {income.isRecurring && <span className="text-[8px] sm:text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">FIXO</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 py-6 sm:py-8 px-4 text-center mt-auto border-t border-white/5">
        <p className="text-slate-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">
          Controle financeiro © 2026 | Desenvolvido por <span className="text-white">Leo Moraes</span>
        </p>
      </footer>

      <ExpenseModal 
        isOpen={isExpenseModalOpen} 
        onClose={() => { setIsExpenseModalOpen(false); setEditingItem(null); }} 
        onSuccess={fetchData}
        initialData={editingItem?.type === 'expense' ? editingItem : null}
      />
      
      <IncomeModal 
        isOpen={isIncomeModalOpen} 
        onClose={() => { setIsIncomeModalOpen(false); setEditingItem(null); }} 
        onSuccess={fetchData}
        initialData={editingItem?.type === 'income' ? editingItem : null}
      />

      <ConfirmationModal 
        isOpen={!!deleteConfig}
        onClose={() => setDeleteConfig(null)}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        message="Esta ação é irreversível. O registro será removido permanentemente dos arquivos."
        confirmText="Remover Definitivamente"
        isLoading={isDeleteLoading}
      />

      <ConfirmationModal 
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={logout}
        title="Encerrar Sessão"
        message="Tem certeza que deseja sair do sistema? Você precisará de suas credenciais para retornar."
        confirmText="Sair do Sistema"
      />

      {user && (
        <UserEditModal 
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          userData={{ name: user.name, email: user.email }}
          onSuccess={async () => {
            try {
              // Busca dados atualizados do backend e atualiza o contexto
              // sem reload — mantém o estado do dashboard intacto
              const res = await api.get('/users/me');
              updateUser(res.data);
            } catch {
              // Se falhar em buscar, logout por segurança (dados podem estar desatualizados)
              logout();
            }
          }}
        />
      )}

      {isEmergencyModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Reserva de Emergência</h3>
            <p className="text-slate-500 text-sm font-medium mb-6">Defina o valor que deseja proteger do seu patrimônio líquido.</p>
            
            <form onSubmit={handleEmergencyFundSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Valor da Reserva (R$)</label>
                <input 
                  autoFocus
                  type="number" 
                  step="0.01"
                  value={emergencyFundInput}
                  onChange={(e) => setEmergencyFundInput(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-slate-900 font-bold focus:outline-none focus:border-slate-900 transition-all"
                  placeholder="0,00"
                />
              </div>
              
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEmergencyModalOpen(false)}
                  className="flex-1 py-4 text-sm font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isEmergencyLoading}
                  className="flex-1 bg-slate-900 text-white py-4 rounded-2xl text-sm font-black hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50 uppercase tracking-widest"
                >
                  {isEmergencyLoading ? 'Salvando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
