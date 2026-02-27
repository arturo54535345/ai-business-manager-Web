import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useTaskStore } from '../stores/taskStores';
import { Plus, CheckSquare, Search, Edit2, Trash2, CheckCircle2, LayoutList, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Archive, XCircle, Clock, X } from 'lucide-react';
import TaskModal from '../components/crm/TaskModal';
import type { Task } from '../types';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

export default function Tasks() {
  const navigate = useNavigate();
  const { tasks, isLoading, fetchTasks, deleteTask, updateTask } = useTaskStore();
  
  // Estados para el Modal de Crear/Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null); 
  
  // 👈 NUEVO: Estados para la Agenda Diaria
  const [isAgendaOpen, setIsAgendaOpen] = useState(false);
  const [agendaDate, setAgendaDate] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'archive'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleEdit = (task: Task) => { 
    setTaskToEdit(task); 
    setSelectedDate(null); 
    setIsModalOpen(true); 
    setIsAgendaOpen(false); // Cierra agenda si estaba abierta
  };
  
  const handleDelete = async (id: string) => { if (window.confirm('¿Eliminar esta tarea definitivamente?')) await deleteTask(id); };
  
  const handleToggleCompleted = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await updateTask(task._id, { status: newStatus });
  };

  const handleAddInDate = (dateString: string) => {
    setTaskToEdit(null);
    setSelectedDate(dateString);
    setIsAgendaOpen(false);
    setIsModalOpen(true);
  };

  // 👈 NUEVO: Lógica de Clic en el Calendario
  const handleDayClick = (dateString: string, dayTasks: Task[]) => {
    if (dayTasks.length > 1) {
      // Si hay más de 1 tarea, abrimos la Agenda Diaria
      setAgendaDate(dateString);
      setIsAgendaOpen(true);
    } else {
      // Si está vacío o solo tiene 1, abrimos creación directa
      handleAddInDate(dateString);
    }
  };

  const handleClearArchive = async () => {
    if (window.confirm('¿Estás seguro de que quieres borrar TODAS las tareas completadas? Esta acción no se puede deshacer.')) {
      const completedTasks = tasks.filter(t => t.status === 'completed');
      for (const task of completedTasks) {
        await deleteTask(task._id);
      }
    }
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 

  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));

  const activeTasks = tasks.filter(t => t.status !== 'completed' && t.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const archivedTasks = tasks.filter(t => t.status === 'completed' && t.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const allFilteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // 👈 NUEVO: Obtener y ordenar las tareas para la Agenda
  const agendaTasks = agendaDate 
    ? allFilteredTasks
        .filter(t => t.dueDate?.startsWith(agendaDate))
        // Ordenamos por hora. Las que no tienen hora ('24:00') se van al final del día.
        .sort((a, b) => (a.dueTime || '24:00').localeCompare(b.dueTime || '24:00'))
    : [];

  return (
    <div className="space-y-8 pb-10 max-w-6xl mx-auto">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Proyectos y Tareas</h1>
          <p className="text-sm text-neutral-500 mt-1 font-light">Planifica, ejecuta y mantén tu espacio de trabajo limpio.</p>
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
          <button onClick={() => { setTaskToEdit(null); setSelectedDate(null); setIsModalOpen(true); }} className="w-full sm:w-auto px-5 py-2.5 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-all shadow-sm flex items-center justify-center whitespace-nowrap">
            <Plus className="w-4 h-4 mr-2" /> Nueva Tarea
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-200 pb-px gap-4">
        <div className="flex items-center space-x-2">
          <button onClick={() => setViewMode('list')} className={`flex items-center px-4 py-2 text-sm font-medium transition-colors border-b-2 ${viewMode === 'list' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}>
            <LayoutList className="w-4 h-4 mr-2" /> Activas <span className="ml-2 bg-neutral-100 text-neutral-600 py-0.5 px-2 rounded-full text-xs">{activeTasks.length}</span>
          </button>
          <button onClick={() => setViewMode('calendar')} className={`flex items-center px-4 py-2 text-sm font-medium transition-colors border-b-2 ${viewMode === 'calendar' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}>
            <CalendarIcon className="w-4 h-4 mr-2" /> Calendario
          </button>
          <button onClick={() => setViewMode('archive')} className={`flex items-center px-4 py-2 text-sm font-medium transition-colors border-b-2 ${viewMode === 'archive' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}>
            <Archive className="w-4 h-4 mr-2" /> Archivo
          </button>
        </div>

        {viewMode === 'archive' && archivedTasks.length > 0 && (
          <button onClick={handleClearArchive} className="flex items-center text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors">
            <XCircle className="w-4 h-4 mr-1.5" /> Vaciar archivo
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'list' && (
          <motion.div key="list" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="bg-white rounded-[2rem] border border-neutral-200/60 shadow-sm overflow-hidden min-h-[300px]">
            {activeTasks.length === 0 ? (
              <div className="p-16 text-center">
                <CheckSquare className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-neutral-900">Todo al día</h3>
                <p className="text-neutral-500 mt-1 font-light">No tienes tareas pendientes ahora mismo.</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                <AnimatePresence>
                  {activeTasks.map((task) => (
                    <motion.div key={task._id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} onClick={() => navigate(`/tasks/${task._id}`)} className="p-5 hover:bg-neutral-50/80 transition-colors flex items-center justify-between group cursor-pointer">
                      <div className="flex items-start space-x-4">
                        <button onClick={(e) => { e.stopPropagation(); handleToggleCompleted(task); }} className="mt-1 flex-shrink-0 group/btn relative">
                          <div className="w-5 h-5 rounded border-2 border-neutral-300 group-hover/btn:border-emerald-500 transition-colors"></div>
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 absolute top-0 left-0 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        </button>
                        <div>
                          <h3 className="font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">{task.title}</h3>
                          <div className="flex items-center space-x-3 mt-1 text-xs text-neutral-500 font-medium">
                            <span className={`px-2 py-0.5 rounded-md border ${task.priority === 'high' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-neutral-50 text-neutral-600 border-neutral-200'}`}>
                              {task.priority === 'high' ? 'Urgente' : 'Normal'}
                            </span>
                            {task.dueDate && <span>📅 {new Date(task.dueDate).toLocaleDateString('es-ES', { day:'numeric', month:'short' })}</span>}
                            {/* 👈 NUEVO: Mostramos la hora en la lista */}
                            {task.dueTime && <span className="flex items-center"><Clock className="w-3 h-3 mr-1" />{task.dueTime}</span>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(task); }} className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200/50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(task._id); }} className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {viewMode === 'archive' && (
          <motion.div key="archive" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="bg-neutral-50/50 rounded-[2rem] border border-neutral-200/60 shadow-sm overflow-hidden min-h-[300px]">
             {archivedTasks.length === 0 ? (
              <div className="p-16 text-center"><Archive className="w-12 h-12 text-neutral-200 mx-auto mb-4" /><h3 className="text-lg font-bold text-neutral-900">Archivo vacío</h3></div>
            ) : (
              <div className="divide-y divide-neutral-200/60">
                <AnimatePresence>
                  {archivedTasks.map((task) => (
                    <motion.div key={task._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={() => navigate(`/tasks/${task._id}`)} className="p-4 hover:bg-white transition-colors flex items-center justify-between group cursor-pointer">
                      <div className="flex items-start space-x-4 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handleToggleCompleted(task); }} className="mt-1" title="Devolver a tareas activas"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></button>
                        <div><h3 className="font-semibold text-neutral-500 line-through">{task.title}</h3></div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(task._id); }} className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {viewMode === 'calendar' && (
          <motion.div key="calendar" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="bg-white rounded-[2rem] border border-neutral-200/60 shadow-sm overflow-hidden p-6">
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
                <div key={day} className="text-center text-xs font-bold text-neutral-400 uppercase tracking-wider py-2">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[100px] rounded-xl bg-neutral-50/50 border border-neutral-100/50"></div>
              ))}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const tasksForDay = allFilteredTasks.filter(t => t.dueDate && t.dueDate.startsWith(dateString));
                const isToday = new Date().toISOString().split('T')[0] === dateString;

                return (
                  <div 
                    key={day} onClick={() => handleDayClick(dateString, tasksForDay)} // 👈 Modificamos el click del día
                    className={`min-h-[100px] p-2 rounded-xl border transition-all cursor-pointer group ${isToday ? 'border-neutral-900 bg-neutral-50/30 ring-1 ring-neutral-900' : 'border-neutral-200 hover:border-neutral-300 hover:shadow-sm'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-lg ${isToday ? 'bg-neutral-900 text-white' : 'text-neutral-600'}`}>{day}</span>
                      <Plus className="w-4 h-4 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    <div className="space-y-1.5 mt-2">
                      {tasksForDay.map(task => (
                        <div 
                          key={task._id} onClick={(e) => { e.stopPropagation(); navigate(`/tasks/${task._id}`); }}
                          className={`text-xs p-1.5 rounded-md truncate font-medium border hover:scale-[1.02] transition-transform ${
                            task.status === 'completed' 
                              ? 'bg-neutral-100 text-neutral-400 border-neutral-200 line-through opacity-60' 
                              : task.priority === 'high' 
                                ? 'bg-rose-50 text-rose-700 border-rose-200' 
                                : 'bg-white text-neutral-700 border-neutral-200 shadow-sm hover:border-neutral-300'
                          }`}
                        >
                          {/* 👈 NUEVO: Mostrar la hora dentro de la etiqueta del calendario */}
                          {task.dueTime && <span className="mr-1 opacity-70">{task.dueTime}</span>}
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
      </AnimatePresence>

      <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} taskToEdit={taskToEdit} defaultDate={selectedDate} />

      {/* 👈 NUEVO: MODAL DE AGENDA DIARIA */}
      <AnimatePresence>
        {isAgendaOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAgendaOpen(false)} className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-xl border border-neutral-200 w-full max-w-md relative z-10 overflow-hidden flex flex-col max-h-[80vh]">
              
              <div className="p-6 border-b border-neutral-100 flex justify-between items-start bg-neutral-50/30">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">Agenda Diaria</h2>
                  <p className="text-sm text-neutral-500 mt-1 capitalize">
                    {agendaDate && new Date(agendaDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
                <button onClick={() => setIsAgendaOpen(false)} className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                {agendaTasks.map((task) => (
                  <div key={task._id} onClick={() => { setIsAgendaOpen(false); navigate(`/tasks/${task._id}`); }} className="group relative flex gap-4 p-4 rounded-xl border border-neutral-100 hover:border-neutral-300 hover:shadow-sm transition-all cursor-pointer bg-white">
                    {/* Línea de tiempo visual */}
                    <div className="flex flex-col items-center min-w-[50px]">
                      <span className="text-sm font-bold text-neutral-900">{task.dueTime || '--:--'}</span>
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5">{!task.dueTime && 'Todo el día'}</span>
                    </div>
                    
                    <div className="w-px bg-neutral-100 relative">
                      <div className={`absolute top-1 -left-1 w-2.5 h-2.5 rounded-full border-2 border-white ${task.status === 'completed' ? 'bg-neutral-300' : task.priority === 'high' ? 'bg-rose-500' : 'bg-primary-500'}`}></div>
                    </div>

                    <div className="flex-1 pb-1">
                      <h4 className={`text-sm font-bold ${task.status === 'completed' ? 'text-neutral-400 line-through' : 'text-neutral-900'}`}>{task.title}</h4>
                      {task.client && <p className="text-xs text-neutral-500 mt-1 font-medium flex items-center">Cliente asignado</p>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-neutral-100 bg-neutral-50">
                <button 
                  onClick={() => handleAddInDate(agendaDate!)} 
                  className="w-full py-3 border-2 border-dashed border-neutral-300 rounded-xl text-sm font-bold text-neutral-600 hover:text-neutral-900 hover:border-neutral-400 hover:bg-neutral-100/50 transition-all flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" /> Añadir cita a este día
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}