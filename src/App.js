import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, TrendingDown, AlertTriangle, Download, Plus, Trash2, 
  DollarSign, PiggyBank, Calendar, Moon, Sun, BarChart3, PieChart as PieChartIcon,
  TrendingUp as LineChartIcon, Target, Bell, FileSpreadsheet, Users, Settings,
  Baby, Home, Car, Gamepad2, Folder, Tag, X, CreditCard, Building2, Wallet, Edit, Eye
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
const API = `${BACKEND_URL}/api`;

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

const CATEGORY_ICONS = {
  baby: Baby,
  home: Home,
  car: Car,
  gamepad: Gamepad2,
  folder: Folder,
  tag: Tag
};

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [months, setMonths] = useState([]);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [annualSummary, setAnnualSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMonth, setEditingMonth] = useState(null);
  const [newExpenseDialog, setNewExpenseDialog] = useState(false);
  const [newExpense, setNewExpense] = useState({ name: "", budget: 0, actual: 0, type: "fixed", categoryId: null });
  const [error, setError] = useState(null);
  
  // Family config state
  const [familyConfig, setFamilyConfig] = useState({ members: [], categories: [], bank_accounts: [] });
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", percentage: 0 });
  const [newCategory, setNewCategory] = useState({ name: "", icon: "folder", color: "#3b82f6" });
  const [newBankAccount, setNewBankAccount] = useState({ name: "", type: "checking", color: "#3b82f6" });

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch family config first
      const configRes = await axios.get(`${API}/family-config`);
      setFamilyConfig(configRes.data || { members: [], categories: [] });
      
      const monthsRes = await axios.get(`${API}/months`);
      setMonths(monthsRes.data || []);
      
      const alertsRes = await axios.get(`${API}/alerts`);
      setAlerts(alertsRes.data || []);
      
      try {
        const summaryRes = await axios.get(`${API}/annual-summary/${selectedYear}`);
        setAnnualSummary(summaryRes.data || null);
      } catch {
        setAnnualSummary(null);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error al cargar datos. Haz clic en 'Cargar Demo' para iniciar.");
    }
    setLoading(false);
  }, [selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Seed sample data
  const seedData = async () => {
    try {
      setLoading(true);
      await axios.post(`${API}/seed-sample-data`);
      await fetchData();
    } catch (err) {
      console.error("Error seeding data:", err);
      setError("Error al cargar datos de demo");
    }
    setLoading(false);
  };

  // Dismiss single alert
  const dismissAlert = async (alertKey) => {
    try {
      await axios.post(`${API}/alerts/dismiss?alert_key=${encodeURIComponent(alertKey)}`);
      await fetchData();
    } catch (err) {
      console.error("Error dismissing alert:", err);
    }
  };

  // Clear all alerts
  const clearAllAlerts = async () => {
    try {
      await axios.delete(`${API}/alerts/clear-all`);
      await fetchData();
    } catch (err) {
      console.error("Error clearing alerts:", err);
    }
  };

  // Create new year
  const createYear = async () => {
    try {
      setLoading(true);
      await axios.post(`${API}/create-year/${selectedYear}`);
      await fetchData();
    } catch (err) {
      console.error("Error creating year:", err);
      setError("Error al crear el año");
    }
    setLoading(false);
  };

  // Export to Excel
  const exportExcel = async () => {
    try {
      const response = await axios.get(`${API}/export-excel/${selectedYear}`, {
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `presupuesto_familiar_${selectedYear}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error exporting:", err);
    }
  };

  // Update family config
  const updateFamilyConfig = async () => {
    try {
      // Validate percentages
      const total = familyConfig.members.reduce((sum, m) => sum + (parseFloat(m.percentage) || 0), 0);
      if (Math.abs(total - 100) > 0.1) {
        alert(`Los porcentajes deben sumar 100%. Actualmente suman ${total.toFixed(1)}%`);
        return;
      }
      
      await axios.put(`${API}/family-config`, {
        members: familyConfig.members,
        categories: familyConfig.categories,
        bank_accounts: familyConfig.bank_accounts
      });
      await fetchData();
      setConfigDialogOpen(false);
    } catch (err) {
      console.error("Error updating config:", err);
      alert(err.response?.data?.detail || "Error al guardar configuración");
    }
  };

  // Add member
  const addMember = () => {
    if (!newMember.name) return;
    const updated = {
      ...familyConfig,
      members: [...familyConfig.members, { 
        id: Date.now().toString(), 
        name: newMember.name, 
        percentage: parseFloat(newMember.percentage) || 0 
      }]
    };
    setFamilyConfig(updated);
    setNewMember({ name: "", percentage: 0 });
  };

  // Delete member
  const deleteMember = (id) => {
    setFamilyConfig({
      ...familyConfig,
      members: familyConfig.members.filter(m => m.id !== id)
    });
  };

  // Add category
  const addCategory = () => {
    if (!newCategory.name) return;
    const updated = {
      ...familyConfig,
      categories: [...familyConfig.categories, {
        id: Date.now().toString(),
        name: newCategory.name,
        icon: newCategory.icon,
        color: newCategory.color
      }]
    };
    setFamilyConfig(updated);
    setNewCategory({ name: "", icon: "folder", color: "#3b82f6" });
  };

  // Delete category
  const deleteCategory = (id) => {
    setFamilyConfig({
      ...familyConfig,
      categories: familyConfig.categories.filter(c => c.id !== id)
    });
  };

  // Add bank account
  const addBankAccount = () => {
    if (!newBankAccount.name) return;
    const updated = {
      ...familyConfig,
      bank_accounts: [...(familyConfig.bank_accounts || []), {
        id: Date.now().toString(),
        name: newBankAccount.name,
        type: newBankAccount.type,
        color: newBankAccount.color
      }]
    };
    setFamilyConfig(updated);
    setNewBankAccount({ name: "", type: "checking", color: "#3b82f6" });
  };

  // Delete bank account
  const deleteBankAccount = (id) => {
    setFamilyConfig({
      ...familyConfig,
      bank_accounts: (familyConfig.bank_accounts || []).filter(a => a.id !== id)
    });
  };

  // Update month data
  const updateMonth = async (year, month, data) => {
    try {
      await axios.put(`${API}/months/${year}/${month}`, data);
      await fetchData();
      setEditDialogOpen(false);
    } catch (err) {
      console.error("Error updating month:", err);
    }
  };

  // Add expense to category
  const addExpenseToCategory = (categoryId) => {
    if (!editingMonth || !newExpense.name) return;
    
    const expenseData = {
      name: newExpense.name,
      budget: parseFloat(newExpense.budget) || 0,
      actual: parseFloat(newExpense.actual) || 0
    };
    
    const updated = { ...editingMonth };
    
    if (categoryId) {
      // Add to category
      if (!updated.category_expenses) updated.category_expenses = {};
      if (!updated.category_expenses[categoryId]) updated.category_expenses[categoryId] = [];
      updated.category_expenses[categoryId] = [...updated.category_expenses[categoryId], expenseData];
    } else if (newExpense.type === "fixed") {
      updated.fixed_expenses = [...(updated.fixed_expenses || []), expenseData];
    } else {
      updated.variable_expenses = [...(updated.variable_expenses || []), expenseData];
    }
    
    setEditingMonth(updated);
    setNewExpense({ name: "", budget: 0, actual: 0, type: "fixed", categoryId: null });
    setNewExpenseDialog(false);
  };

  // Delete expense from category
  const deleteExpenseFromCategory = (categoryId, index) => {
    if (!editingMonth) return;
    const updated = { ...editingMonth };
    if (categoryId && updated.category_expenses && updated.category_expenses[categoryId]) {
      updated.category_expenses[categoryId] = updated.category_expenses[categoryId].filter((_, i) => i !== index);
    }
    setEditingMonth(updated);
  };

  // Delete expense
  const deleteExpense = (type, index) => {
    if (!editingMonth) return;
    const updated = { ...editingMonth };
    if (type === "fixed") {
      updated.fixed_expenses = (updated.fixed_expenses || []).filter((_, i) => i !== index);
    } else {
      updated.variable_expenses = (updated.variable_expenses || []).filter((_, i) => i !== index);
    }
    setEditingMonth(updated);
  };

  // Get member name by ID
  const getMemberName = (memberId) => {
    const member = familyConfig.members.find(m => m.id === memberId);
    return member ? member.name : memberId;
  };

  // Calculate totals with safe defaults
  const calculateMonthTotals = (month) => {
    if (!month) return { income: 0, fixedBudget: 0, fixedActual: 0, variableBudget: 0, variableActual: 0, categoryActual: 0, totalBudget: 0, totalActual: 0, savings: 0 };
    
    const income = Object.values(month.income || {}).reduce((a, b) => a + (Number(b) || 0), 0);
    const fixedBudget = (month.fixed_expenses || []).reduce((a, b) => a + (Number(b.budget) || 0), 0);
    const fixedActual = (month.fixed_expenses || []).reduce((a, b) => a + (Number(b.actual) || 0), 0);
    const variableBudget = (month.variable_expenses || []).reduce((a, b) => a + (Number(b.budget) || 0), 0);
    const variableActual = (month.variable_expenses || []).reduce((a, b) => a + (Number(b.actual) || 0), 0);
    
    // Calculate category expenses
    let categoryBudget = 0;
    let categoryActual = 0;
    Object.values(month.category_expenses || {}).forEach(expenses => {
      expenses.forEach(e => {
        categoryBudget += Number(e.budget) || 0;
        categoryActual += Number(e.actual) || 0;
      });
    });
    
    return {
      income,
      fixedBudget,
      fixedActual,
      variableBudget,
      variableActual,
      categoryBudget,
      categoryActual,
      totalBudget: fixedBudget + variableBudget + categoryBudget,
      totalActual: fixedActual + variableActual + categoryActual,
      savings: income - (fixedActual + variableActual + categoryActual)
    };
  };

  // Prepare chart data
  const getBarChartData = () => {
    const filtered = (months || []).filter(m => m && m.year === selectedYear);
    return filtered.map(m => {
      const totals = calculateMonthTotals(m);
      return {
        name: (m.month_name || "").substring(0, 3),
        Presupuesto: totals.totalBudget,
        Real: totals.totalActual,
        month: m.month
      };
    });
  };

  const getPieChartData = () => {
    if (!selectedMonth) return [];
    const month = (months || []).find(m => m && m.year === selectedYear && m.month === selectedMonth);
    if (!month) return [];
    
    const allExpenses = [
      ...(month.fixed_expenses || []).map(e => ({ name: e.name || "Sin nombre", value: Number(e.actual) || 0 })),
      ...(month.variable_expenses || []).map(e => ({ name: e.name || "Sin nombre", value: Number(e.actual) || 0 }))
    ];
    
    // Add category expenses
    Object.entries(month.category_expenses || {}).forEach(([catId, expenses]) => {
      const cat = familyConfig.categories.find(c => c.id === catId);
      const catName = cat ? cat.name : "Otros";
      const catTotal = expenses.reduce((sum, e) => sum + (Number(e.actual) || 0), 0);
      if (catTotal > 0) {
        allExpenses.push({ name: catName, value: catTotal });
      }
    });
    
    return allExpenses.filter(e => e.value > 0);
  };

  const getLineChartData = () => {
    const filtered = (months || []).filter(m => m && m.year === selectedYear);
    return filtered.map(m => {
      const totals = calculateMonthTotals(m);
      return {
        name: (m.month_name || "").substring(0, 3),
        Ingresos: totals.income,
        Gastos: totals.totalActual,
        Ahorro: totals.savings
      };
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value || 0);
  };

  const filteredMonths = (months || []).filter(m => m && m.year === selectedYear);

  const CategoryIcon = ({ icon, className }) => {
    const Icon = CATEGORY_ICONS[icon] || Folder;
    return <Icon className={className} />;
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-slate-900" : "bg-slate-50"}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${darkMode ? "bg-slate-800/95" : "bg-white/95"} backdrop-blur border-b ${darkMode ? "border-slate-700" : "border-slate-200"} px-6 py-4`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${darkMode ? "bg-blue-600" : "bg-blue-500"}`}>
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
                Presupuesto Familiar
              </h1>
              <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                Control de gastos y ahorro
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 15 }, (_, i) => 2020 + i).map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={() => setConfigDialogOpen(true)} data-testid="config-btn">
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </Button>
            
            <Button variant="outline" size="sm" onClick={seedData}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Demo
            </Button>
            
            <Button variant="outline" size="sm" onClick={exportExcel} disabled={filteredMonths.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>
            
            <div className="flex items-center gap-2">
              <Sun className={`h-4 w-4 ${darkMode ? "text-slate-500" : "text-amber-500"}`} />
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              <Moon className={`h-4 w-4 ${darkMode ? "text-blue-400" : "text-slate-400"}`} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Family Members Summary */}
        {familyConfig.members.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Users className={`h-5 w-5 ${darkMode ? "text-slate-400" : "text-slate-500"}`} />
                <span className={`font-medium ${darkMode ? "text-white" : "text-slate-900"}`}>Responsabilidad:</span>
              </div>
              {familyConfig.members.map((member, idx) => (
                <Badge key={member.id} variant="outline" className="text-sm py-1 px-3">
                  {member.name}: {member.percentage}%
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <Alert className="mb-6 bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertTitle>Aviso</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {!loading && (
          <>
            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Bell className={`h-5 w-5 ${darkMode ? "text-red-400" : "text-red-500"}`} />
                    <h2 className={`font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>
                      Alertas ({alerts.length})
                    </h2>
                  </div>
                  <Button variant="outline" size="sm" onClick={clearAllAlerts} className="text-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Borrar Todas
                  </Button>
                </div>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {alerts.slice(0, 6).map((alert, idx) => (
                    <Alert key={idx} variant="destructive" className={`relative ${darkMode ? "bg-red-900/30 border-red-800" : "bg-red-50 border-red-200"}`}>
                      <button 
                        onClick={() => dismissAlert(alert.alert_key)}
                        className="absolute top-2 right-2 p-1 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                        title="Descartar alerta"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="text-sm pr-6">{alert.item_name} - {alert.month}</AlertTitle>
                      <AlertDescription className="text-xs">
                        Exceso: {formatCurrency(alert.overage)} ({(alert.percentage_over || 0).toFixed(1)}%)
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Cards */}
            {annualSummary && (
              <div className="grid gap-4 md:grid-cols-4 mb-8">
                <Card className={darkMode ? "bg-slate-800 border-slate-700" : ""}>
                  <CardHeader className="pb-2">
                    <CardTitle className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Ingresos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      <span className={`text-2xl font-bold ${darkMode ? "text-white" : ""}`}>
                        {formatCurrency(annualSummary.total_income)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className={darkMode ? "bg-slate-800 border-slate-700" : ""}>
                  <CardHeader className="pb-2">
                    <CardTitle className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Gastos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-red-500" />
                      <span className={`text-2xl font-bold ${darkMode ? "text-white" : ""}`}>
                        {formatCurrency(annualSummary.total_expenses)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className={darkMode ? "bg-slate-800 border-slate-700" : ""}>
                  <CardHeader className="pb-2">
                    <CardTitle className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Ahorro</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <PiggyBank className={`h-5 w-5 ${(annualSummary.total_savings || 0) >= 0 ? "text-green-500" : "text-red-500"}`} />
                      <span className={`text-2xl font-bold ${(annualSummary.total_savings || 0) >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {formatCurrency(annualSummary.total_savings)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className={darkMode ? "bg-slate-800 border-slate-700" : ""}>
                  <CardHeader className="pb-2">
                    <CardTitle className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Proyección</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-500" />
                      <span className={`text-2xl font-bold ${darkMode ? "text-white" : ""}`}>
                        {formatCurrency(annualSummary.savings_projection?.projected_annual_savings)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* No Data */}
            {filteredMonths.length === 0 && !loading && (
              <Card className={`mb-8 ${darkMode ? "bg-slate-800 border-slate-700" : ""}`}>
                <CardContent className="py-12 text-center">
                  <Calendar className={`h-12 w-12 mx-auto mb-4 ${darkMode ? "text-slate-600" : "text-slate-300"}`} />
                  <h3 className={`text-lg font-medium mb-2 ${darkMode ? "text-white" : ""}`}>No hay datos para {selectedYear}</h3>
                  <p className={`mb-4 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                    Inicia el año {selectedYear} para comenzar a registrar tu presupuesto
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={createYear} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Iniciar {selectedYear}
                    </Button>
                    <Button variant="outline" onClick={seedData}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Cargar Demo (2024)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main Tabs */}
            {filteredMonths.length > 0 && (
              <Tabs defaultValue="charts" className="space-y-6">
                <TabsList className={`${darkMode ? "bg-slate-800" : "bg-white"} p-1`}>
                  <TabsTrigger value="charts" className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Gráficas
                  </TabsTrigger>
                  <TabsTrigger value="monthly" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    Por Mes
                  </TabsTrigger>
                  <TabsTrigger value="annual" className="gap-2">
                    <LineChartIcon className="h-4 w-4" />
                    Anual
                  </TabsTrigger>
                </TabsList>

                {/* Charts Tab */}
                <TabsContent value="charts" className="space-y-6">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card className={darkMode ? "bg-slate-800 border-slate-700" : ""}>
                      <CardHeader>
                        <CardTitle className={`flex items-center gap-2 ${darkMode ? "text-white" : ""}`}>
                          <BarChart3 className="h-5 w-5 text-blue-500" />
                          Presupuesto vs Real
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={getBarChartData()}>
                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                            <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                            <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                            <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: darkMode ? "#1f2937" : "#fff", borderRadius: "8px" }} />
                            <Legend />
                            <Bar dataKey="Presupuesto" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Real" fill="#ef4444" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card className={darkMode ? "bg-slate-800 border-slate-700" : ""}>
                      <CardHeader>
                        <CardTitle className={`flex items-center gap-2 ${darkMode ? "text-white" : ""}`}>
                          <LineChartIcon className="h-5 w-5 text-green-500" />
                          Evolución Mensual
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={getLineChartData()}>
                            <defs>
                              <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorAhorro" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                            <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                            <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                            <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: darkMode ? "#1f2937" : "#fff", borderRadius: "8px" }} />
                            <Legend />
                            <Area type="monotone" dataKey="Ingresos" stroke="#3b82f6" fillOpacity={1} fill="url(#colorIngresos)" />
                            <Area type="monotone" dataKey="Gastos" stroke="#ef4444" fillOpacity={1} fill="url(#colorGastos)" />
                            <Area type="monotone" dataKey="Ahorro" stroke="#10b981" fillOpacity={1} fill="url(#colorAhorro)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Pie Chart */}
                  <Card className={darkMode ? "bg-slate-800 border-slate-700" : ""}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className={`flex items-center gap-2 ${darkMode ? "text-white" : ""}`}>
                          <PieChartIcon className="h-5 w-5 text-purple-500" />
                          Distribución de Gastos
                        </CardTitle>
                        <Select value={selectedMonth?.toString() || ""} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Seleccionar mes" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredMonths.map(m => (
                              <SelectItem key={m.month} value={m.month.toString()}>{m.month_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {selectedMonth && getPieChartData().length > 0 ? (
                        <div className="flex flex-col lg:flex-row items-center gap-8">
                          <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                              <Pie data={getPieChartData()} cx="50%" cy="50%" outerRadius={140} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                                {getPieChartData().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => formatCurrency(value)} />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="w-full lg:w-64 space-y-2">
                            {getPieChartData().map((item, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                                  <span className={`text-sm ${darkMode ? "text-slate-300" : "text-slate-600"}`}>{item.name}</span>
                                </div>
                                <span className={`text-sm font-medium ${darkMode ? "text-white" : ""}`}>{formatCurrency(item.value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className={`text-center py-16 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                          Selecciona un mes para ver la distribución
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Monthly Tab */}
                <TabsContent value="monthly">
                  <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {filteredMonths.map((month) => {
                      const totals = calculateMonthTotals(month);
                      const isPositive = totals.savings >= 0;
                      
                      return (
                        <Card 
                          key={`${month.year}-${month.month}`}
                          className={`cursor-pointer transition-all hover:scale-105 ${darkMode ? "bg-slate-800 border-slate-700 hover:border-blue-500" : "hover:border-blue-400"}`}
                          onClick={() => { setEditingMonth({ ...month }); setEditDialogOpen(true); }}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className={`text-lg ${darkMode ? "text-white" : ""}`}>{month.month_name}</CardTitle>
                              <Badge variant={isPositive ? "default" : "destructive"}>
                                {isPositive ? "+" : ""}{formatCurrency(totals.savings)}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className={darkMode ? "text-slate-400" : "text-slate-500"}>Ingresos</span>
                                <span className="text-blue-500 font-medium">{formatCurrency(totals.income)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className={darkMode ? "text-slate-400" : "text-slate-500"}>Gastos</span>
                                <span className="text-red-500 font-medium">{formatCurrency(totals.totalActual)}</span>
                              </div>
                            </div>
                            <Progress value={totals.income > 0 ? Math.min((totals.totalActual / totals.income) * 100, 100) : 0} className="h-2" />
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>

                {/* Annual Tab */}
                <TabsContent value="annual" className="space-y-6">
                  {annualSummary && (
                    <>
                      {/* Member Contributions */}
                      {annualSummary.member_contributions && Object.keys(annualSummary.member_contributions).length > 0 && (
                        <Card className={darkMode ? "bg-slate-800 border-slate-700" : ""}>
                          <CardHeader>
                            <CardTitle className={`flex items-center gap-2 ${darkMode ? "text-white" : ""}`}>
                              <Users className="h-5 w-5 text-blue-500" />
                              Balance por Miembro
                            </CardTitle>
                            <CardDescription className={darkMode ? "text-slate-400" : ""}>
                              Ingresos aportados vs responsabilidad de gastos
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {/* Chart */}
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={familyConfig.members.map(member => {
                                const income = annualSummary.member_contributions?.[member.name] || 0;
                                const responsibility = (annualSummary.total_expenses || 0) * (member.percentage / 100);
                                const balance = income - responsibility;
                                return {
                                  name: member.name,
                                  "Ingresos Aportados": income,
                                  "Responsabilidad Gastos": responsibility,
                                  balance: balance
                                };
                              })}>
                                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                                <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                                <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                                <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: darkMode ? "#1f2937" : "#fff", borderRadius: "8px" }} />
                                <Legend />
                                <Bar dataKey="Ingresos Aportados" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Responsabilidad Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                            
                            {/* Detail Cards */}
                            <div className="grid gap-4 md:grid-cols-2 mt-6">
                              {familyConfig.members.map((member) => {
                                const income = annualSummary.member_contributions?.[member.name] || 0;
                                const totalIncome = annualSummary.total_income || 1;
                                const incomePercentage = (income / totalIncome) * 100;
                                const responsibility = (annualSummary.total_expenses || 0) * (member.percentage / 100);
                                const balance = income - responsibility;
                                const isPositive = balance >= 0;
                                
                                return (
                                  <div key={member.name} className={`p-5 rounded-xl border-2 ${darkMode ? "bg-slate-700 border-slate-600" : "bg-white border-slate-200"}`}>
                                    <div className="flex items-center justify-between mb-4">
                                      <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isPositive ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600"}`}>
                                          <Users className="h-6 w-6" />
                                        </div>
                                        <div>
                                          <h4 className={`font-bold text-lg ${darkMode ? "text-white" : ""}`}>{member.name}</h4>
                                          <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                                            Responsabilidad: {member.percentage}%
                                          </p>
                                        </div>
                                      </div>
                                      <Badge variant={isPositive ? "default" : "destructive"} className="text-sm px-3 py-1">
                                        {isPositive ? "+" : ""}{formatCurrency(balance)}
                                      </Badge>
                                    </div>
                                    
                                    <div className="space-y-3">
                                      <div className="flex justify-between items-center">
                                        <span className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                                          Ingresos aportados
                                        </span>
                                        <div className="text-right">
                                          <span className="text-blue-500 font-bold">{formatCurrency(income)}</span>
                                          <span className={`text-xs ml-2 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                                            ({incomePercentage.toFixed(1)}% del total)
                                          </span>
                                        </div>
                                      </div>
                                      
                                      <div className="flex justify-between items-center">
                                        <span className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                                          Debería pagar ({member.percentage}%)
                                        </span>
                                        <span className="text-red-500 font-bold">{formatCurrency(responsibility)}</span>
                                      </div>
                                      
                                      <div className={`h-px ${darkMode ? "bg-slate-600" : "bg-slate-200"}`} />
                                      
                                      <div className="flex justify-between items-center">
                                        <span className={`font-medium ${darkMode ? "text-white" : ""}`}>
                                          Balance
                                        </span>
                                        <span className={`font-bold text-lg ${isPositive ? "text-green-500" : "text-red-500"}`}>
                                          {isPositive ? "+" : ""}{formatCurrency(balance)}
                                        </span>
                                      </div>
                                      
                                      <p className={`text-xs ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                                        {isPositive 
                                          ? `${member.name} aporta más de lo que le corresponde pagar`
                                          : `${member.name} debería aportar ${formatCurrency(Math.abs(balance))} más`
                                        }
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            
                            {/* Summary */}
                            <div className={`mt-6 p-4 rounded-lg ${darkMode ? "bg-slate-700" : "bg-slate-100"}`}>
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                  <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Total Ingresos</p>
                                  <p className="text-xl font-bold text-blue-500">{formatCurrency(annualSummary.total_income)}</p>
                                </div>
                                <div>
                                  <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Total Gastos</p>
                                  <p className="text-xl font-bold text-red-500">{formatCurrency(annualSummary.total_expenses)}</p>
                                </div>
                                <div>
                                  <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Ahorro Familiar</p>
                                  <p className={`text-xl font-bold ${(annualSummary.total_savings || 0) >= 0 ? "text-green-500" : "text-red-500"}`}>
                                    {formatCurrency(annualSummary.total_savings)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Expense Categories */}
                      <Card className={darkMode ? "bg-slate-800 border-slate-700" : ""}>
                        <CardHeader>
                          <CardTitle className={`flex items-center gap-2 ${darkMode ? "text-white" : ""}`}>
                            <PieChartIcon className="h-5 w-5 text-purple-500" />
                            Gastos por Categoría
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {Object.entries(annualSummary.expense_by_category || {})
                              .sort(([,a], [,b]) => b - a)
                              .slice(0, 9)
                              .map(([name, value], index) => (
                                <div key={name} className={`p-4 rounded-lg ${darkMode ? "bg-slate-700" : "bg-slate-100"}`}>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className={`font-medium text-sm ${darkMode ? "text-white" : ""}`}>{name}</span>
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                                  </div>
                                  <p className={`text-xl font-bold ${darkMode ? "text-white" : ""}`}>{formatCurrency(value)}</p>
                                </div>
                              ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Savings Projection */}
                      <Card className={darkMode ? "bg-slate-800 border-slate-700" : ""}>
                        <CardHeader>
                          <CardTitle className={`flex items-center gap-2 ${darkMode ? "text-white" : ""}`}>
                            <Target className="h-5 w-5 text-green-500" />
                            Proyección de Ahorro
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-6 md:grid-cols-3">
                            <div>
                              <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Ahorro Actual</p>
                              <p className={`text-3xl font-bold ${(annualSummary.total_savings || 0) >= 0 ? "text-green-500" : "text-red-500"}`}>
                                {formatCurrency(annualSummary.total_savings)}
                              </p>
                            </div>
                            <div>
                              <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Promedio Mensual</p>
                              <p className={`text-3xl font-bold ${darkMode ? "text-white" : ""}`}>
                                {formatCurrency(annualSummary.savings_projection?.avg_monthly_savings)}
                              </p>
                            </div>
                            <div>
                              <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Proyección Anual</p>
                              <p className="text-3xl font-bold text-purple-500">
                                {formatCurrency(annualSummary.savings_projection?.projected_annual_savings)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Bank Balances Evolution */}
                      {(familyConfig.bank_accounts || []).length > 0 && (
                        <Card className={darkMode ? "bg-slate-800 border-slate-700" : ""}>
                          <CardHeader>
                            <CardTitle className={`flex items-center gap-2 ${darkMode ? "text-white" : ""}`}>
                              <Building2 className="h-5 w-5 text-blue-500" />
                              Evolución de Saldos Bancarios
                            </CardTitle>
                            <CardDescription className={darkMode ? "text-slate-400" : ""}>
                              Saldos mensuales de cada cuenta
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                              <AreaChart data={(annualSummary.monthly_data || []).map(m => {
                                const data = { name: m.month_name?.substring(0, 3) || "" };
                                (familyConfig.bank_accounts || []).forEach(acc => {
                                  data[acc.name] = m.bank_balances?.[acc.id] || 0;
                                });
                                return data;
                              })}>
                                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                                <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                                <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                                <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: darkMode ? "#1f2937" : "#fff", borderRadius: "8px" }} />
                                <Legend />
                                {(familyConfig.bank_accounts || []).map((acc, idx) => (
                                  <Area 
                                    key={acc.id} 
                                    type="monotone" 
                                    dataKey={acc.name} 
                                    stroke={acc.color} 
                                    fill={acc.color} 
                                    fillOpacity={0.3}
                                  />
                                ))}
                              </AreaChart>
                            </ResponsiveContainer>
                            
                            {/* Current Balances Summary */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
                              {(familyConfig.bank_accounts || []).map((acc) => {
                                const lastMonth = (annualSummary.monthly_data || []).slice(-1)[0];
                                const currentBalance = lastMonth?.bank_balances?.[acc.id] || 0;
                                const firstMonth = (annualSummary.monthly_data || []).find(m => m.bank_balances?.[acc.id]);
                                const initialBalance = firstMonth?.bank_balances?.[acc.id] || 0;
                                const change = currentBalance - initialBalance;
                                
                                return (
                                  <div key={acc.id} className={`p-4 rounded-lg ${darkMode ? "bg-slate-700" : "bg-slate-100"}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: acc.color }}>
                                        {acc.type === "savings" ? <PiggyBank className="h-3 w-3 text-white" /> : 
                                         acc.type === "credit" ? <CreditCard className="h-3 w-3 text-white" /> :
                                         <Wallet className="h-3 w-3 text-white" />}
                                      </div>
                                      <span className={`font-medium ${darkMode ? "text-white" : ""}`}>{acc.name}</span>
                                    </div>
                                    <p className={`text-2xl font-bold ${darkMode ? "text-white" : ""}`}>
                                      {formatCurrency(currentBalance)}
                                    </p>
                                    {change !== 0 && (
                                      <p className={`text-sm ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
                                        {change >= 0 ? "+" : ""}{formatCurrency(change)} vs inicio
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </>
        )}
      </main>

      {/* Config Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className={`max-w-2xl max-h-[90vh] overflow-y-auto ${darkMode ? "bg-slate-800 border-slate-700" : ""}`}>
          <DialogHeader>
            <DialogTitle className={darkMode ? "text-white" : ""}>Configuración Familiar</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Members Section */}
            <div>
              <h3 className={`font-semibold mb-3 flex items-center gap-2 ${darkMode ? "text-white" : ""}`}>
                <Users className="h-4 w-4 text-blue-500" />
                Miembros y Responsabilidad
              </h3>
              <p className={`text-sm mb-3 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                Define quién contribuye a los ingresos y su porcentaje de responsabilidad (debe sumar 100%)
              </p>
              
              <div className="space-y-2 mb-4">
                {familyConfig.members.map((member, idx) => (
                  <div key={member.id} className={`flex items-center gap-3 p-3 rounded-lg ${darkMode ? "bg-slate-700" : "bg-slate-50"}`}>
                    <Input
                      value={member.name}
                      onChange={(e) => {
                        const updated = [...familyConfig.members];
                        updated[idx] = { ...member, name: e.target.value };
                        setFamilyConfig({ ...familyConfig, members: updated });
                      }}
                      placeholder="Nombre"
                      className={`flex-1 ${darkMode ? "bg-slate-600 border-slate-500" : ""}`}
                    />
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={member.percentage}
                        onChange={(e) => {
                          const updated = [...familyConfig.members];
                          updated[idx] = { ...member, percentage: parseFloat(e.target.value) || 0 };
                          setFamilyConfig({ ...familyConfig, members: updated });
                        }}
                        className={`w-20 ${darkMode ? "bg-slate-600 border-slate-500" : ""}`}
                      />
                      <span className={darkMode ? "text-slate-400" : "text-slate-500"}>%</span>
                    </div>
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteMember(member.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="Nombre del miembro"
                  className={`flex-1 ${darkMode ? "bg-slate-700 border-slate-600" : ""}`}
                />
                <Input
                  type="number"
                  value={newMember.percentage}
                  onChange={(e) => setNewMember({ ...newMember, percentage: e.target.value })}
                  placeholder="%"
                  className={`w-20 ${darkMode ? "bg-slate-700 border-slate-600" : ""}`}
                />
                <Button onClick={addMember}><Plus className="h-4 w-4" /></Button>
              </div>
              
              <p className={`text-sm mt-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                Total: {familyConfig.members.reduce((sum, m) => sum + (parseFloat(m.percentage) || 0), 0).toFixed(1)}%
              </p>
            </div>

            {/* Categories Section */}
            <div>
              <h3 className={`font-semibold mb-3 flex items-center gap-2 ${darkMode ? "text-white" : ""}`}>
                <Tag className="h-4 w-4 text-purple-500" />
                Categorías de Gastos
              </h3>
              <p className={`text-sm mb-3 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                Crea categorías personalizadas como "Niños", "Mascotas", etc.
              </p>
              
              <div className="space-y-2 mb-4">
                {familyConfig.categories.map((cat) => (
                  <div key={cat.id} className={`flex items-center gap-3 p-3 rounded-lg ${darkMode ? "bg-slate-700" : "bg-slate-50"}`}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: cat.color }}>
                      <CategoryIcon icon={cat.icon} className="h-4 w-4 text-white" />
                    </div>
                    <span className={`flex-1 font-medium ${darkMode ? "text-white" : ""}`}>{cat.name}</span>
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteCategory(cat.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Nombre de categoría"
                  className={`flex-1 ${darkMode ? "bg-slate-700 border-slate-600" : ""}`}
                />
                <Select value={newCategory.icon} onValueChange={(v) => setNewCategory({ ...newCategory, icon: v })}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baby">Niños</SelectItem>
                    <SelectItem value="home">Casa</SelectItem>
                    <SelectItem value="car">Auto</SelectItem>
                    <SelectItem value="gamepad">Ocio</SelectItem>
                    <SelectItem value="folder">Otro</SelectItem>
                  </SelectContent>
                </Select>
                <input
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <Button onClick={addCategory}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Bank Accounts Section */}
            <div>
              <h3 className={`font-semibold mb-3 flex items-center gap-2 ${darkMode ? "text-white" : ""}`}>
                <Building2 className="h-4 w-4 text-green-500" />
                Cuentas Bancarias
              </h3>
              <p className={`text-sm mb-3 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                Agrega tus cuentas de banco para llevar el control de saldos mes a mes
              </p>
              
              <div className="space-y-2 mb-4">
                {(familyConfig.bank_accounts || []).map((account) => (
                  <div key={account.id} className={`flex items-center gap-3 p-3 rounded-lg ${darkMode ? "bg-slate-700" : "bg-slate-50"}`}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: account.color }}>
                      {account.type === "savings" ? <PiggyBank className="h-4 w-4 text-white" /> : 
                       account.type === "credit" ? <CreditCard className="h-4 w-4 text-white" /> :
                       <Wallet className="h-4 w-4 text-white" />}
                    </div>
                    <span className={`flex-1 font-medium ${darkMode ? "text-white" : ""}`}>{account.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {account.type === "savings" ? "Ahorro" : account.type === "credit" ? "Crédito" : "Corriente"}
                    </Badge>
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteBankAccount(account.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={newBankAccount.name}
                  onChange={(e) => setNewBankAccount({ ...newBankAccount, name: e.target.value })}
                  placeholder="Nombre del banco/cuenta"
                  className={`flex-1 ${darkMode ? "bg-slate-700 border-slate-600" : ""}`}
                />
                <Select value={newBankAccount.type} onValueChange={(v) => setNewBankAccount({ ...newBankAccount, type: v })}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Corriente</SelectItem>
                    <SelectItem value="savings">Ahorro</SelectItem>
                    <SelectItem value="credit">Crédito</SelectItem>
                  </SelectContent>
                </Select>
                <input
                  type="color"
                  value={newBankAccount.color}
                  onChange={(e) => setNewBankAccount({ ...newBankAccount, color: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <Button onClick={addBankAccount}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>Cancelar</Button>
            <Button onClick={updateFamilyConfig}>Guardar Configuración</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Month Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className={`max-w-5xl max-h-[90vh] overflow-y-auto ${darkMode ? "bg-slate-800 border-slate-700" : ""}`}>
          <DialogHeader>
            <DialogTitle className={darkMode ? "text-white" : ""}>
              {editingMonth?.month_name} {editingMonth?.year}
            </DialogTitle>
          </DialogHeader>
          
          {editingMonth && (
            <Tabs defaultValue="charts" className="w-full">
              <TabsList className={`grid w-full grid-cols-2 ${darkMode ? "bg-slate-700" : ""}`}>
                <TabsTrigger value="charts" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Ver Gráficas
                </TabsTrigger>
                <TabsTrigger value="edit" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Editar Datos
                </TabsTrigger>
              </TabsList>

              {/* Charts Tab */}
              <TabsContent value="charts" className="space-y-6 mt-4">
                {(() => {
                  const totals = calculateMonthTotals(editingMonth);
                  const monthIncome = Object.values(editingMonth.income || {}).reduce((a, b) => a + (Number(b) || 0), 0);
                  
                  // Prepare bar chart data for budget vs actual
                  const budgetVsActualData = [
                    ...(editingMonth.fixed_expenses || []).map(e => ({
                      name: e.name?.substring(0, 12) || "Sin nombre",
                      Presupuesto: e.budget || 0,
                      Real: e.actual || 0
                    })),
                    ...(editingMonth.variable_expenses || []).map(e => ({
                      name: e.name?.substring(0, 12) || "Sin nombre",
                      Presupuesto: e.budget || 0,
                      Real: e.actual || 0
                    }))
                  ].filter(d => d.Presupuesto > 0 || d.Real > 0).slice(0, 10);
                  
                  // Prepare pie chart data
                  const pieData = [
                    ...(editingMonth.fixed_expenses || []).map(e => ({ name: e.name, value: e.actual || 0 })),
                    ...(editingMonth.variable_expenses || []).map(e => ({ name: e.name, value: e.actual || 0 })),
                    ...Object.entries(editingMonth.category_expenses || {}).flatMap(([catId, expenses]) => {
                      const cat = familyConfig.categories.find(c => c.id === catId);
                      return expenses.map(e => ({ name: `${cat?.name || ''}: ${e.name}`, value: e.actual || 0 }));
                    })
                  ].filter(d => d.value > 0);
                  
                  return (
                    <>
                      {/* Summary Cards */}
                      <div className="grid gap-4 md:grid-cols-4">
                        <div className={`p-4 rounded-lg ${darkMode ? "bg-slate-700" : "bg-blue-50"}`}>
                          <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Ingresos</p>
                          <p className="text-2xl font-bold text-blue-500">{formatCurrency(totals.income)}</p>
                        </div>
                        <div className={`p-4 rounded-lg ${darkMode ? "bg-slate-700" : "bg-red-50"}`}>
                          <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Gastos</p>
                          <p className="text-2xl font-bold text-red-500">{formatCurrency(totals.totalActual)}</p>
                        </div>
                        <div className={`p-4 rounded-lg ${darkMode ? "bg-slate-700" : "bg-green-50"}`}>
                          <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Ahorro</p>
                          <p className={`text-2xl font-bold ${totals.savings >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {formatCurrency(totals.savings)}
                          </p>
                        </div>
                        <div className={`p-4 rounded-lg ${darkMode ? "bg-slate-700" : "bg-purple-50"}`}>
                          <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>% Gastado</p>
                          <p className="text-2xl font-bold text-purple-500">
                            {totals.income > 0 ? ((totals.totalActual / totals.income) * 100).toFixed(1) : 0}%
                          </p>
                        </div>
                      </div>

                      {/* Budget vs Actual Chart */}
                      <Card className={darkMode ? "bg-slate-700 border-slate-600" : ""}>
                        <CardHeader className="pb-2">
                          <CardTitle className={`text-sm flex items-center gap-2 ${darkMode ? "text-white" : ""}`}>
                            <BarChart3 className="h-4 w-4 text-blue-500" />
                            Presupuesto vs Real
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {budgetVsActualData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                              <BarChart data={budgetVsActualData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                                <XAxis type="number" stroke={darkMode ? "#9ca3af" : "#6b7280"} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                                <YAxis type="category" dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} width={100} tick={{fontSize: 11}} />
                                <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: darkMode ? "#1f2937" : "#fff", borderRadius: "8px" }} />
                                <Legend />
                                <Bar dataKey="Presupuesto" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                                <Bar dataKey="Real" fill="#ef4444" radius={[0, 4, 4, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <p className={`text-center py-8 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                              No hay gastos registrados
                            </p>
                          )}
                        </CardContent>
                      </Card>

                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Pie Chart - Distribution */}
                        <Card className={darkMode ? "bg-slate-700 border-slate-600" : ""}>
                          <CardHeader className="pb-2">
                            <CardTitle className={`text-sm flex items-center gap-2 ${darkMode ? "text-white" : ""}`}>
                              <PieChartIcon className="h-4 w-4 text-purple-500" />
                              Distribución de Gastos
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {pieData.length > 0 ? (
                              <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                  <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name?.substring(0, 8)} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                  >
                                    {pieData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip formatter={(value) => formatCurrency(value)} />
                                </PieChart>
                              </ResponsiveContainer>
                            ) : (
                              <p className={`text-center py-8 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                                No hay gastos registrados
                              </p>
                            )}
                          </CardContent>
                        </Card>

                        {/* Member Balance */}
                        <Card className={darkMode ? "bg-slate-700 border-slate-600" : ""}>
                          <CardHeader className="pb-2">
                            <CardTitle className={`text-sm flex items-center gap-2 ${darkMode ? "text-white" : ""}`}>
                              <Users className="h-4 w-4 text-green-500" />
                              Balance por Miembro
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {familyConfig.members.map((member) => {
                                const memberIncome = editingMonth.income?.[member.id] || 0;
                                const responsibility = totals.totalActual * (member.percentage / 100);
                                const balance = memberIncome - responsibility;
                                const isPositive = balance >= 0;
                                
                                return (
                                  <div key={member.id} className={`p-3 rounded-lg ${darkMode ? "bg-slate-600" : "bg-slate-50"}`}>
                                    <div className="flex items-center justify-between mb-2">
                                      <span className={`font-medium ${darkMode ? "text-white" : ""}`}>{member.name}</span>
                                      <Badge variant={isPositive ? "default" : "destructive"}>
                                        {isPositive ? "+" : ""}{formatCurrency(balance)}
                                      </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      <div>
                                        <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Aportó</p>
                                        <p className="text-blue-500 font-medium">{formatCurrency(memberIncome)}</p>
                                      </div>
                                      <div>
                                        <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Debe ({member.percentage}%)</p>
                                        <p className="text-red-500 font-medium">{formatCurrency(responsibility)}</p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Bank Balances */}
                      {(familyConfig.bank_accounts || []).length > 0 && (
                        <Card className={darkMode ? "bg-slate-700 border-slate-600" : ""}>
                          <CardHeader className="pb-2">
                            <CardTitle className={`text-sm flex items-center gap-2 ${darkMode ? "text-white" : ""}`}>
                              <Building2 className="h-4 w-4 text-blue-500" />
                              Saldos Bancarios del Mes
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                              {(familyConfig.bank_accounts || []).map((acc) => (
                                <div key={acc.id} className={`p-3 rounded-lg ${darkMode ? "bg-slate-600" : "bg-slate-50"}`}>
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: acc.color }}>
                                      {acc.type === "savings" ? <PiggyBank className="h-3 w-3 text-white" /> : 
                                       acc.type === "credit" ? <CreditCard className="h-3 w-3 text-white" /> :
                                       <Wallet className="h-3 w-3 text-white" />}
                                    </div>
                                    <span className={`text-sm ${darkMode ? "text-slate-300" : "text-slate-600"}`}>{acc.name}</span>
                                  </div>
                                  <p className={`text-xl font-bold ${darkMode ? "text-white" : ""}`}>
                                    {formatCurrency(editingMonth.bank_balances?.[acc.id] || 0)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  );
                })()}
              </TabsContent>

              {/* Edit Tab */}
              <TabsContent value="edit" className="space-y-6 mt-4">
                {/* Income by Member */}
                <div>
                  <h3 className={`font-semibold mb-3 flex items-center gap-2 ${darkMode ? "text-white" : ""}`}>
                    <DollarSign className="h-4 w-4 text-blue-500" />
                    Ingresos por Miembro
                  </h3>
                  <div className="grid gap-3">
                    {familyConfig.members.map((member) => (
                      <div key={member.id} className="flex items-center gap-3">
                        <Label className={`w-40 ${darkMode ? "text-slate-300" : ""}`}>
                          {member.name} ({member.percentage}%)
                        </Label>
                        <Input
                          type="number"
                          value={editingMonth.income?.[member.id] || 0}
                          onChange={(e) => {
                            const updated = { ...editingMonth };
                            if (!updated.income) updated.income = {};
                            updated.income[member.id] = parseFloat(e.target.value) || 0;
                            setEditingMonth(updated);
                          }}
                          className={darkMode ? "bg-slate-700 border-slate-600" : ""}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fixed Expenses */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-semibold flex items-center gap-2 ${darkMode ? "text-white" : ""}`}>
                      <TrendingDown className="h-4 w-4 text-orange-500" />
                      Gastos Fijos
                    </h3>
                    <Button size="sm" variant="outline" onClick={() => { setNewExpense({ name: "", budget: 0, actual: 0, type: "fixed", categoryId: null }); setNewExpenseDialog(true); }}>
                      <Plus className="h-4 w-4 mr-1" /> Agregar
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(editingMonth.fixed_expenses || []).map((exp, idx) => {
                      const diff = (exp.budget || 0) - (exp.actual || 0);
                      return (
                        <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg ${darkMode ? "bg-slate-700" : "bg-slate-50"}`}>
                          <span className={`w-32 font-medium text-sm ${darkMode ? "text-white" : ""}`}>{exp.name}</span>
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <Input type="number" value={exp.budget} onChange={(e) => {
                              const updated = { ...editingMonth };
                              updated.fixed_expenses = [...updated.fixed_expenses];
                              updated.fixed_expenses[idx] = { ...exp, budget: parseFloat(e.target.value) || 0 };
                              setEditingMonth(updated);
                            }} placeholder="Presupuesto" className={`h-8 ${darkMode ? "bg-slate-600" : ""}`} />
                            <Input type="number" value={exp.actual} onChange={(e) => {
                              const updated = { ...editingMonth };
                              updated.fixed_expenses = [...updated.fixed_expenses];
                              updated.fixed_expenses[idx] = { ...exp, actual: parseFloat(e.target.value) || 0 };
                              setEditingMonth(updated);
                            }} placeholder="Real" className={`h-8 ${darkMode ? "bg-slate-600" : ""}`} />
                          </div>
                          <Badge variant={diff >= 0 ? "default" : "destructive"} className="w-20 justify-center text-xs">
                            {diff >= 0 ? "+" : ""}{formatCurrency(diff)}
                          </Badge>
                          <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteExpense("fixed", idx)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Variable Expenses */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-semibold flex items-center gap-2 ${darkMode ? "text-white" : ""}`}>
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      Gastos Variables
                    </h3>
                    <Button size="sm" variant="outline" onClick={() => { setNewExpense({ name: "", budget: 0, actual: 0, type: "variable", categoryId: null }); setNewExpenseDialog(true); }}>
                      <Plus className="h-4 w-4 mr-1" /> Agregar
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(editingMonth.variable_expenses || []).map((exp, idx) => {
                      const diff = (exp.budget || 0) - (exp.actual || 0);
                      return (
                        <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg ${darkMode ? "bg-slate-700" : "bg-slate-50"}`}>
                          <span className={`w-32 font-medium text-sm ${darkMode ? "text-white" : ""}`}>{exp.name}</span>
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <Input type="number" value={exp.budget} onChange={(e) => {
                              const updated = { ...editingMonth };
                              updated.variable_expenses = [...updated.variable_expenses];
                              updated.variable_expenses[idx] = { ...exp, budget: parseFloat(e.target.value) || 0 };
                              setEditingMonth(updated);
                            }} placeholder="Presupuesto" className={`h-8 ${darkMode ? "bg-slate-600" : ""}`} />
                            <Input type="number" value={exp.actual} onChange={(e) => {
                              const updated = { ...editingMonth };
                              updated.variable_expenses = [...updated.variable_expenses];
                              updated.variable_expenses[idx] = { ...exp, actual: parseFloat(e.target.value) || 0 };
                              setEditingMonth(updated);
                            }} placeholder="Real" className={`h-8 ${darkMode ? "bg-slate-600" : ""}`} />
                          </div>
                          <Badge variant={diff >= 0 ? "default" : "destructive"} className="w-20 justify-center text-xs">
                            {diff >= 0 ? "+" : ""}{formatCurrency(diff)}
                          </Badge>
                          <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteExpense("variable", idx)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Category Expenses */}
                {familyConfig.categories.map((cat) => (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className={`font-semibold flex items-center gap-2 ${darkMode ? "text-white" : ""}`}>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: cat.color }}>
                          <CategoryIcon icon={cat.icon} className="h-3 w-3 text-white" />
                        </div>
                        {cat.name}
                      </h3>
                      <Button size="sm" variant="outline" onClick={() => { setNewExpense({ name: "", budget: 0, actual: 0, type: "category", categoryId: cat.id }); setNewExpenseDialog(true); }}>
                        <Plus className="h-4 w-4 mr-1" /> Agregar
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(editingMonth.category_expenses?.[cat.id] || []).map((exp, idx) => {
                        const diff = (exp.budget || 0) - (exp.actual || 0);
                        return (
                          <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg ${darkMode ? "bg-slate-700" : "bg-slate-50"}`}>
                            <span className={`w-32 font-medium text-sm ${darkMode ? "text-white" : ""}`}>{exp.name}</span>
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <Input type="number" value={exp.budget} onChange={(e) => {
                                const updated = { ...editingMonth };
                                if (!updated.category_expenses) updated.category_expenses = {};
                                if (!updated.category_expenses[cat.id]) updated.category_expenses[cat.id] = [];
                                updated.category_expenses[cat.id] = [...updated.category_expenses[cat.id]];
                                updated.category_expenses[cat.id][idx] = { ...exp, budget: parseFloat(e.target.value) || 0 };
                                setEditingMonth(updated);
                              }} placeholder="Presupuesto" className={`h-8 ${darkMode ? "bg-slate-600" : ""}`} />
                              <Input type="number" value={exp.actual} onChange={(e) => {
                                const updated = { ...editingMonth };
                                if (!updated.category_expenses) updated.category_expenses = {};
                                if (!updated.category_expenses[cat.id]) updated.category_expenses[cat.id] = [];
                                updated.category_expenses[cat.id] = [...updated.category_expenses[cat.id]];
                                updated.category_expenses[cat.id][idx] = { ...exp, actual: parseFloat(e.target.value) || 0 };
                                setEditingMonth(updated);
                              }} placeholder="Real" className={`h-8 ${darkMode ? "bg-slate-600" : ""}`} />
                            </div>
                            <Badge variant={diff >= 0 ? "default" : "destructive"} className="w-20 justify-center text-xs">
                              {diff >= 0 ? "+" : ""}{formatCurrency(diff)}
                            </Badge>
                            <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteExpenseFromCategory(cat.id, idx)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                      {(!editingMonth.category_expenses?.[cat.id] || editingMonth.category_expenses[cat.id].length === 0) && (
                        <p className={`text-sm ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                          No hay gastos en esta categoría
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Bank Balances */}
                {(familyConfig.bank_accounts || []).length > 0 && (
                  <div>
                    <h3 className={`font-semibold mb-3 flex items-center gap-2 ${darkMode ? "text-white" : ""}`}>
                      <Building2 className="h-4 w-4 text-green-500" />
                      Saldos Bancarios
                    </h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      {(familyConfig.bank_accounts || []).map((account) => (
                        <div key={account.id} className={`flex items-center gap-3 p-3 rounded-lg ${darkMode ? "bg-slate-700" : "bg-slate-50"}`}>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: account.color }}>
                            {account.type === "savings" ? <PiggyBank className="h-4 w-4 text-white" /> : 
                             account.type === "credit" ? <CreditCard className="h-4 w-4 text-white" /> :
                             <Wallet className="h-4 w-4 text-white" />}
                          </div>
                          <div className="flex-1">
                            <Label className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{account.name}</Label>
                            <Input
                              type="number"
                              value={editingMonth?.bank_balances?.[account.id] || 0}
                              onChange={(e) => {
                                const updated = { ...editingMonth };
                                if (!updated.bank_balances) updated.bank_balances = {};
                                updated.bank_balances[account.id] = parseFloat(e.target.value) || 0;
                                setEditingMonth(updated);
                              }}
                              placeholder="Saldo"
                              className={`h-8 ${darkMode ? "bg-slate-600 border-slate-500" : ""}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={() => editingMonth && updateMonth(editingMonth.year, editingMonth.month, {
                    income: editingMonth.income,
                    fixed_expenses: editingMonth.fixed_expenses,
                    variable_expenses: editingMonth.variable_expenses,
                    category_expenses: editingMonth.category_expenses,
                    bank_balances: editingMonth.bank_balances
                  })}>
                    Guardar Cambios
                  </Button>
                </DialogFooter>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={newExpenseDialog} onOpenChange={setNewExpenseDialog}>
        <DialogContent className={darkMode ? "bg-slate-800 border-slate-700" : ""}>
          <DialogHeader>
            <DialogTitle className={darkMode ? "text-white" : ""}>
              Agregar Gasto {newExpense.categoryId ? `a ${familyConfig.categories.find(c => c.id === newExpense.categoryId)?.name}` : newExpense.type === "fixed" ? "Fijo" : "Variable"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className={darkMode ? "text-slate-300" : ""}>Nombre</Label>
              <Input
                value={newExpense.name}
                onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                placeholder="Ej: Escuela, Actividades..."
                className={darkMode ? "bg-slate-700 border-slate-600" : ""}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={darkMode ? "text-slate-300" : ""}>Presupuesto</Label>
                <Input
                  type="number"
                  value={newExpense.budget}
                  onChange={(e) => setNewExpense({ ...newExpense, budget: e.target.value })}
                  className={darkMode ? "bg-slate-700 border-slate-600" : ""}
                />
              </div>
              <div>
                <Label className={darkMode ? "text-slate-300" : ""}>Real</Label>
                <Input
                  type="number"
                  value={newExpense.actual}
                  onChange={(e) => setNewExpense({ ...newExpense, actual: e.target.value })}
                  className={darkMode ? "bg-slate-700 border-slate-600" : ""}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewExpenseDialog(false)}>Cancelar</Button>
            <Button onClick={() => addExpenseToCategory(newExpense.categoryId)}>Agregar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
