import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 1. IMPORTAMOS LA BRÚJULA
import { motion} from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useTaskStore } from '../stores/taskStores';
import { Plus, CheckSquare, Search, Edit2, Trash2, CheckCircle2, LayoutList, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import TaskModal from '../components/crm/TaskModal';
import type { Task } from '../types';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function Tasks() {
  const navigate = useNavigate(); // 👈 2. ACTIVAMOS LA BRÚJULA
  const { tasks, isLoading, fetchTasks, deleteTask, updateTask } = useTaskStore();
  
  // Estados de la interfaz
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null); 
  
  // Vistas y Filtros
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Lógica del Calendario
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchTasks();
  }, []);

  // Funciones de acción
  const handleEdit = (task: Task) => { setTaskToEdit(task); setSelectedDate(null); setIsModalOpen(true); };
  const handleDelete = async (id: string) => { if (window.confirm('¿Eliminar esta tarea?')) await deleteTask(id); };
  const handleMarkAsCompleted = async (task: Task) => await updateTask(task._id, { status: 'completed' });

  const handleAddInDate = (dateString: string) => {
    setTaskToEdit(null);
    setSelectedDate(dateString);
    setIsModalOpen(true);
  };

  // --- MATEMÁTICAS DEL CALENDARIO ---
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 

  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));

  // --- FILTRADO POR BUSCADOR ---
  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-8 pb-10 max-w-6xl mx-auto">
      
      {/* CABECERA Y BUSCADOR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Proyectos y Tareas</h1>
          <p className="text-sm text-neutral-500 mt-1 font-light">Planifica, busca y ejecuta sin distracciones.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text" placeholder="Buscar tarea..." 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 transition-all shadow-sm"
            />
          </div>

          <button 
            onClick={() => { setTaskToEdit(null); setSelectedDate(null); setIsModalOpen(true); }}
            className="w-full sm:w-auto px-5 py-2.5 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-all shadow-sm flex items-center justify-center whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-2" /> Nueva Tarea
          </button>
        </div>
      </div>

      {/* SELECTOR DE VISTA */}
      <div className="flex items-center space-x-1 border-b border-neutral-200 pb-px">
        <button onClick={() => setViewMode('list')} className={`flex items-center px-4 py-2 text-sm font-medium transition-colors border-b-2 ${viewMode === 'list' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}>
          <LayoutList className="w-4 h-4 mr-2" /> Vista Lista
        </button>
        <button onClick={() => setViewMode('calendar')} className={`flex items-center px-4 py-2 text-sm font-medium transition-colors border-b-2 ${viewMode === 'calendar' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}>
          <CalendarIcon className="w-4 h-4 mr-2" /> Calendario
        </button>
      </div>

      {/* ---------------- VISTA LISTA ---------------- */}
      {viewMode === 'list' && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="bg-white rounded-[2rem] border border-neutral-200/60 shadow-sm overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="p-16 text-center">
              <CheckSquare className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900">No hay tareas</h3>
              <p className="text-neutral-500 mt-1">Tu lista está vacía o no coincide con la búsqueda.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {filteredTasks.map((task) => (
                <div 
                  key={task._id} 
                  onClick={() => navigate(`/tasks/${task._id}`)} // 👈 3. NAVEGACIÓN AL PERFIL DE LA TAREA
                  className="p-5 hover:bg-neutral-50 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-start space-x-4">
                    {/* Botón Completar con stopPropagation */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleMarkAsCompleted(task); }} 
                      className="mt-1"
                    >
                      {task.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-neutral-300" /> : <div className="w-5 h-5 rounded-full border-2 border-neutral-300 hover:border-neutral-500 transition-colors"></div>}
                    </button>
                    <div>
                      <h3 className={`font-semibold ${task.status === 'completed' ? 'line-through text-neutral-400' : 'text-neutral-900'}`}>
                        {task.title}
                      </h3>
                      <div className="flex items-center space-x-3 mt-1 text-xs text-neutral-500 font-medium">
                        <span className={`px-2 py-0.5 rounded-md ${task.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-neutral-100 text-neutral-600'}`}>
                          Prioridad: {task.priority}
                        </span>
                        {task.dueDate && <span>📅 {new Date(task.dueDate).toLocaleDateString('es-ES', { day:'numeric', month:'short' })}</span>}
                      </div>
                    </div>
                  </div>
                  
                  {/* Botones Editar y Borrar con stopPropagation */}
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEdit(task); }} 
                      className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(task._id); }} 
                      className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ---------------- VISTA CALENDARIO ---------------- */}
      {viewMode === 'calendar' && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="bg-white rounded-[2rem] border border-neutral-200/60 shadow-sm overflow-hidden p-6">
          
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-neutral-900 capitalize">
              {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex space-x-2">
              <button onClick={prevMonth} className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-2 text-sm font-medium rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors">Hoy</button>
              <button onClick={nextMonth} className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px mb-2">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-neutral-400 uppercase tracking-wider py-2">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] rounded-xl bg-neutral-50/50 border border-neutral-100/50"></div>
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const tasksForDay = filteredTasks.filter(t => t.dueDate && t.dueDate.startsWith(dateString));
              const isToday = new Date().toISOString().split('T')[0] === dateString;

              return (
                <div 
                  key={day} 
                  onClick={() => handleAddInDate(dateString)}
                  className={`min-h-[100px] p-2 rounded-xl border transition-all cursor-pointer group ${isToday ? 'border-neutral-900 bg-neutral-50/30' : 'border-neutral-200 hover:border-neutral-300 hover:shadow-sm'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm font-semibold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-neutral-900 text-white' : 'text-neutral-500'}`}>{day}</span>
                    <Plus className="w-4 h-4 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div className="space-y-1.5 mt-2">
                    {tasksForDay.map(task => (
                      <div 
                        key={task._id} 
                        onClick={(e) => { e.stopPropagation(); navigate(`/tasks/${task._id}`); }} // 👈 4. NAVEGACIÓN DESDE EL CALENDARIO
                        className={`text-xs p-1.5 rounded-md truncate font-medium border hover:scale-[1.02] transition-transform ${
                          task.status === 'completed' 
                            ? 'bg-neutral-100 text-neutral-400 border-neutral-200 line-through' 
                            : task.priority === 'high' 
                              ? 'bg-red-50 text-red-700 border-red-100' 
                              : 'bg-white text-neutral-700 border-neutral-200 shadow-sm hover:border-neutral-300'
                        }`}
                      >
                        {task.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} taskToEdit={taskToEdit} defaultDate={selectedDate} />
    </div>
  );
}