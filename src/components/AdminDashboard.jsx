import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  collection, onSnapshot, query, orderBy, doc, updateDoc, addDoc, deleteDoc 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  DollarSign, Users, TrendingUp, AlertCircle, Plus, Trash2, Edit3, 
  Search, Filter, UserPlus, X, BarChart3, PieChart, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function AdminDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [allocations, setAllocations] = useState([]);
  const [budgetData, setBudgetData] = useState({ projectId: '', amount: '', allocationId: null });
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'user' });
  const [roleEdit, setRoleEdit] = useState({ email: '', newRole: '' });
  const [roleEditOpen, setRoleEditOpen] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { createUser, updateUserRole, deleteUser, isAdmin } = useAuth();

  // Real-time Firestore projects
  const [projects, setProjects] = useState([]);

  // Helper: get project budget and spend summary
  const getProjectSummary = (project) => {
    // Get all allocations for this project
    const projectAllocations = allocations.filter(a => a.projectId === project.id);
    const allocatedBudget = projectAllocations.reduce((sum, a) => sum + (a.amount || 0), 0);
    const budget = allocatedBudget > 0 ? allocatedBudget : (project.budget || 0);
    // Get all approved transactions for this project
    const projectTransactions = transactions.filter(t => t.projectId === project.id && t.status === 'approved');
    const spent = projectTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const percentUsed = budget > 0 ? (spent / budget) * 100 : 0;
    return { budget, spent, percentUsed, allocations: projectAllocations, transactions: projectTransactions };
  };

  // Get monthly spending data for a project
  const getMonthlySpending = (projectTransactions) => {
    const monthlyData = {};
    const currentDate = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyData[monthKey] = 0;
    }

    // Aggregate spending by month
    projectTransactions.forEach(transaction => {
      if (transaction.createdAt) {
        const transactionDate = new Date(transaction.createdAt.seconds ? transaction.createdAt.seconds * 1000 : transaction.createdAt);
        const monthKey = transactionDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (monthlyData.hasOwnProperty(monthKey)) {
          monthlyData[monthKey] += transaction.amount || 0;
        }
      }
    });

    return monthlyData;
  };

  // Generate pie chart data for budget vs spent
  const generatePieChartData = (summary) => {
    const remaining = Math.max(0, summary.budget - summary.spent);
    return {
      labels: ['Spent', 'Remaining'],
      datasets: [
        {
          data: [summary.spent, remaining],
          backgroundColor: [
            summary.percentUsed > 80 ? '#EF4444' : summary.percentUsed > 60 ? '#F59E0B' : '#10B981',
            '#E5E7EB'
          ],
          borderColor: [
            summary.percentUsed > 80 ? '#DC2626' : summary.percentUsed > 60 ? '#D97706' : '#059669',
            '#D1D5DB'
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  // Generate bar chart data for monthly spending
  const generateBarChartData = (monthlyData) => {
    return {
      labels: Object.keys(monthlyData),
      datasets: [
        {
          label: 'Monthly Spending (KES)',
          data: Object.values(monthlyData),
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          borderRadius: 4,
        },
      ],
    };
  };

  // Chart options
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: KES ${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `KES ${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return 'KES ' + value.toLocaleString();
          }
        }
      }
    },
  };

  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = [];
      snapshot.forEach((doc) => {
        projectsData.push({ id: doc.id, ...doc.data() });
      });
      setProjects(projectsData);
    });
    return () => unsubscribe();
  }, []);

  // Load data from Firestore
  useEffect(() => {
    // Listen to transactions
    const transactionsQuery = query(
      collection(db, 'transactions'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      const transactionsData = [];
      snapshot.forEach((doc) => {
        transactionsData.push({ id: doc.id, ...doc.data() });
      });
      setTransactions(transactionsData);
      setLoading(false);
    });

    // Listen to users
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersData = [];
      snapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersData);
      setFilteredUsers(usersData);
    });

    // Listen to budget allocations
    const q = query(collection(db, 'budget_allocations'), orderBy('allocatedAt', 'desc'));
    const unsubscribeAllocations = onSnapshot(q, (snapshot) => {
      const allocationsData = [];
      snapshot.forEach((doc) => {
        allocationsData.push({ id: doc.id, ...doc.data() });
      });
      setAllocations(allocationsData);
    });

    return () => {
      unsubscribeTransactions();
      unsubscribeUsers();
      unsubscribeAllocations();
    };
  }, []);

  // Filter users based on search and role filter
  useEffect(() => {
    let result = users;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply role filter
    if (filterRole !== 'all') {
      result = result.filter(user => user.role === filterRole);
    }
    
    setFilteredUsers(result);
  }, [searchTerm, filterRole, users]);

  // Delete user handler
  const handleDeleteUser = async (userId, userEmail) => {
    setIsDeleting(true);
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'users', userId));
      
      // Delete from Auth (if using Firebase Auth)
      try {
        await deleteUser(userEmail);
      } catch (authError) {
        console.warn('Auth deletion failed, but Firestore user was removed:', authError);
        // Continue even if auth deletion fails - at least the user is removed from Firestore
      }
      
      toast.success('User deleted successfully!');
      setDeleteConfirm(null); // This will close the modal
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error deleting user');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle user creation
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await createUser(userForm.email, userForm.name, userForm.role);
      setUserForm({ name: '', email: '', role: 'user' });
      setShowUserModal(false);
      toast.success('User created successfully!');
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Error creating user');
    }
  };

  // Handle role update
  const handleRoleEdit = async (e) => {
    e.preventDefault();
    try {
      await updateUserRole(roleEdit.email, roleEdit.newRole);
      setRoleEdit({ email: '', newRole: '' });
      setRoleEditOpen(null);
      toast.success('User role updated successfully!');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Error updating role');
    }
  };

  // Budget allocation handlers
  const handleAllocateBudget = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error('Only admin can allocate or edit budgets.');
      return;
    }
    try {
      const { addDoc, updateDoc, doc: docFn } = await import('firebase/firestore');
      if (budgetData.allocationId) {
        await updateDoc(docFn(db, 'budget_allocations', budgetData.allocationId), {
          projectId: budgetData.projectId,
          amount: parseFloat(budgetData.amount),
          allocatedAt: new Date().toISOString(),
          type: 'budget_allocation'
        });
        toast.success('Budget allocation updated!');
      } else {
        await addDoc(collection(db, 'budget_allocations'), {
          projectId: budgetData.projectId,
          amount: parseFloat(budgetData.amount),
          allocatedAt: new Date().toISOString(),
          type: 'budget_allocation'
        });
        toast.success('Budget allocated successfully!');
      }
      setBudgetData({ projectId: '', amount: '', allocationId: null });
      setShowBudgetModal(false);
    } catch (error) {
      console.error('Error allocating budget:', error);
      toast.error('Error allocating budget');
    }
  };

  const handleEditAllocation = (allocation) => {
    if (!isAdmin) {
      toast.error('Only admin can edit budgets.');
      return;
    }
    setBudgetData({
      projectId: allocation.projectId,
      amount: allocation.amount,
      allocationId: allocation.id
    });
    setShowBudgetModal(true);
  };

  const handleDeleteAllocation = async (allocationId) => {
    if (!isAdmin) {
      toast.error('Only admin can delete budgets.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this allocation?')) return;
    try {
      const { deleteDoc, doc: docFn } = await import('firebase/firestore');
      await deleteDoc(docFn(db, 'budget_allocations', allocationId));
      toast.success('Budget allocation deleted!');
    } catch (error) {
      toast.error('Error deleting allocation');
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate stats
  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const totalBudget = allocations.reduce((sum, a) => sum + (a.amount || 0), 0);
  const totalSpent = transactions
    .filter(t => t.status === 'approved')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const stats = [
    {
      icon: DollarSign,
      title: 'Total Budget',
      value: formatCurrency(totalBudget),
      color: 'bg-blue-500'
    },
    {
      icon: TrendingUp,
      title: 'Total Spent',
      value: formatCurrency(totalSpent),
      color: 'bg-green-500'
    },
    {
      icon: AlertCircle,
      title: 'Pending Approvals',
      value: pendingTransactions.length,
      color: 'bg-yellow-500'
    },
    {
      icon: Users,
      title: 'Active Users',
      value: users.length,
      color: 'bg-purple-500'
    }
  ];

  // Generate overall analytics
  const generateOverallAnalytics = () => {
    const projectSummaries = projects.map(project => getProjectSummary(project));
    
    // Budget utilization pie chart
    const budgetUtilizationData = {
      labels: projects.map(p => p.name),
      datasets: [
        {
          data: projectSummaries.map(s => s.spent),
          backgroundColor: [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
          ],
          borderWidth: 2,
        },
      ],
    };

    // Monthly spending trend for all projects
    const allMonthlyData = {};
    const currentDate = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      allMonthlyData[monthKey] = 0;
    }

    // Aggregate all transactions by month
    transactions.filter(t => t.status === 'approved').forEach(transaction => {
      if (transaction.createdAt) {
        const transactionDate = new Date(transaction.createdAt.seconds ? transaction.createdAt.seconds * 1000 : transaction.createdAt);
        const monthKey = transactionDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (allMonthlyData.hasOwnProperty(monthKey)) {
          allMonthlyData[monthKey] += transaction.amount || 0;
        }
      }
    });

    const overallTrendData = {
      labels: Object.keys(allMonthlyData),
      datasets: [
        {
          label: 'Total Monthly Spending (KES)',
          data: Object.values(allMonthlyData),
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          borderRadius: 4,
        },
      ],
    };

    return { budgetUtilizationData, overallTrendData };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  const { budgetUtilizationData, overallTrendData } = generateOverallAnalytics();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage projects, budgets, and user activities</p>
          </div>
          <button
            onClick={() => setShowBudgetModal(true)}
            className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-4 py-2 rounded-lg transition-all flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Allocate Budget
          </button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-lg"
            >
              <div className={`${stat.color} p-3 rounded-lg inline-block mb-4`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600">{stat.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Overall Analytics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          {/* Budget Utilization Pie Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <PieChart className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Budget Utilization by Project</h2>
            </div>
            <div className="h-80">
              <Pie data={budgetUtilizationData} options={pieChartOptions} />
            </div>
          </div>

          {/* Overall Spending Trend Bar Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <BarChart3 className="h-6 w-6 text-green-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Overall Spending Trend</h2>
            </div>
            <div className="h-80">
              <Bar data={overallTrendData} options={barChartOptions} />
            </div>
          </div>
        </motion.div>

        {/* Project Summaries Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center mb-6">
            <Activity className="h-6 w-6 text-purple-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Project Summaries</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const summary = getProjectSummary(project);
              const monthlyData = getMonthlySpending(summary.transactions);
              const pieData = generatePieChartData(summary);
              const barData = generateBarChartData(monthlyData);
              
              return (
                <div key={project.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center mb-4">
                    <img 
                      src={project.image || 'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=100'} 
                      alt={project.name} 
                      className="h-12 w-12 rounded-lg object-cover mr-4" 
                    />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
                      <p className="text-gray-600 text-sm">{project.description}</p>
                    </div>
                  </div>
                  
                  {/* Budget vs Spent Pie Chart */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Budget Utilization</h4>
                    <div className="h-32">
                      {summary.budget > 0 ? (
                        <Pie data={pieData} options={pieChartOptions} />
                      ) : (
                        <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                          <p className="text-gray-500 text-sm">No budget allocated</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Monthly Spending Bar Chart */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Monthly Spending Trend</h4>
                    <div className="h-24">
                      <Bar data={barData} options={barChartOptions} />
                    </div>
                  </div>
                  
                  {/* Summary Text */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Budget:</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(summary.budget)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Spent:</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(summary.spent)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Utilization:</span>
                      <span className={`font-semibold ${
                        summary.percentUsed > 80 ? 'text-red-600' : 
                        summary.percentUsed > 60 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {summary.percentUsed.toFixed(1)}%
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        {summary.budget === 0
                          ? 'No budget allocated to this project.'
                          : summary.spent === 0
                            ? 'Budget allocated but not yet utilized.'
                            : `${formatCurrency(summary.budget - summary.spent)} remaining of ${formatCurrency(summary.budget)} budget`}
                      </p>
                    </div>
                    
                    {/* Performance Indicator */}
                    <div className="pt-2">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        summary.percentUsed > 90 ? 'bg-red-100 text-red-800' :
                        summary.percentUsed > 75 ? 'bg-yellow-100 text-yellow-800' :
                        summary.percentUsed > 50 ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {summary.percentUsed > 90 ? 'Over Budget Risk' :
                         summary.percentUsed > 75 ? 'High Utilization' :
                         summary.percentUsed > 50 ? 'Moderate Usage' :
                         'Low Utilization'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* User Management Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 mt-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
            <button
              onClick={() => setShowUserModal(true)}
              className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-4 py-2 rounded-lg transition-all flex items-center"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Create User
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 h-4 w-4" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="font-medium text-blue-800">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{user.name || 'No Name'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {roleEditOpen === user.email ? (
                        <form onSubmit={handleRoleEdit} className="flex items-center space-x-2">
                          <select
                            value={roleEdit.newRole}
                            onChange={e => setRoleEdit({ ...roleEdit, newRole: e.target.value, email: user.email })}
                            className="border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button type="submit" className="text-green-600 font-medium">Save</button>
                          <button 
                            type="button" 
                            onClick={() => setRoleEditOpen(null)} 
                            className="text-gray-500"
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setRoleEditOpen(user.email)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit Role"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(user)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Budget Allocations Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Budget Allocations</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocated At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allocations.map((allocation, idx) => (
                  <tr key={allocation.id || idx}>
                    <td className="px-6 py-4 whitespace-nowrap">{projects.find(p => p.id === allocation.projectId)?.name || allocation.projectId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(allocation.amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{allocation.allocatedAt ? new Date(allocation.allocatedAt).toLocaleString() : ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEditAllocation(allocation)}
                        className="text-blue-600 hover:underline mr-2"
                      >Edit</button>
                      <button
                        onClick={() => handleDeleteAllocation(allocation.id)}
                        className="text-red-600 hover:underline"
                      >Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setDeleteConfirm(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Confirm Deletion</h3>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete user <strong>{deleteConfirm.name || 'Unknown User'}</strong> ({deleteConfirm.email})? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleDeleteUser(deleteConfirm.id, deleteConfirm.email)}
                    disabled={isDeleting}
                    className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white py-2 rounded-lg transition-colors flex items-center justify-center"
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      'Delete User'
                    )}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    disabled={isDeleting}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create User Modal */}
        <AnimatePresence>
          {showUserModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowUserModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Create User</h3>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={userForm.name}
                      onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select
                      name="role"
                      value={userForm.role}
                      onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
                    >
                      Create User
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUserModal(false)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Allocate Budget Modal */}
        {showBudgetModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold mb-4">{budgetData.allocationId ? 'Edit Budget Allocation' : 'Allocate Budget'}</h3>
              <form onSubmit={handleAllocateBudget} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                  <select
                    value={budgetData.projectId}
                    onChange={(e) => setBudgetData({...budgetData, projectId: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a project</option>
                    {/* Static options for missing projects */}
                    <option value="HIP Study">HIP Study</option>
                    <option value="RISE Study">RISE Study</option>
                    <option value="J&J MH Study">J&amp;J MH Study</option>
                    <option value="PTB Study">PTB Study (Pulmonary Tuberculosis research initiative)</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (KES)</label>
                  <input
                    type="number"
                    value={budgetData.amount}
                    onChange={(e) => setBudgetData({...budgetData, amount: e.target.value})}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter budget amount"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
                  >
                    {budgetData.allocationId ? 'Update Allocation' : 'Allocate Budget'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowBudgetModal(false); setBudgetData({ projectId: '', amount: '', allocationId: null }); }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;