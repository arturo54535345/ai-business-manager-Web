import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useAnimation } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ArrowRight, BookOpen, CheckSquare, LineChart, Terminal, Sparkles } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utilidad para mezclar clases (estándar en la industria)
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- VARIANTES DE ANIMACIÓN PREMIUM ---

// 1. Animación escalonada para texto (Palabra por palabra)
const sentenceVariant: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.2,
      staggerChildren: 0.04, // Velocidad entre palabras
    },
  },
};

const wordVariant: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] } // Curva de Bezier personalizada "cara"
  },
};

// 2. Animación de entrada suave y profunda para bloques grandes
const deepFadeUp: Variants = {
  hidden: { opacity: 0, y: 60, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.9, ease: [0.25, 1, 0.5, 1] } // "Spring" muy suave y pesado
  }
};

// Componente para animar texto palabra por palabra
const AnimatedText = ({ text, className }: { text: string, className?: string }) => {
  const words = text.split(" ");
  return (
    <motion.h1 variants={sentenceVariant} initial="hidden" animate="visible" className={cn("flex flex-wrap justify-center gap-x-2 gap-y-1", className)}>
      {words.map((word, i) => (
        <motion.span key={i} variants={wordVariant} className="relative inline-block">
          {word === "\n" ? <br /> : word}
        </motion.span>
      ))}
    </motion.h1>
  );
};

export default function Landing() {
  // --- LÓGICA DEL FOCO DE LUZ (MOUSE SPOTLIGHT) ---
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  // Control para las animaciones al hacer scroll
  const featuresRef = useRef(null);
  const isInView = useInView(featuresRef, { once: true, margin: "-100px" });
  const mainControls = useAnimation();

  useEffect(() => {
    if (isInView) mainControls.start("visible");
  }, [isInView, mainControls]);


  return (
    <div ref={containerRef} className="min-h-screen bg-[#FFFEFC] selection:bg-neutral-900 selection:text-white font-sans text-neutral-900 relative overflow-hidden">
      
      {/* --- EL EFECTO WOW: FOCO DE LUZ QUE SIGUE AL RATÓN --- */}
      {/* Es una capa invisible con un degradado radial sutil que se mueve con el ratón */}
      <div 
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.8), transparent 40%)`,
          mixBlendMode: 'soft-light' // Esto hace que la luz se sienta natural sobre el fondo
        }}
      />
      {/* Una segunda capa de luz más amplia y difusa para ambiente */}
      <div 
        className="pointer-events-none fixed inset-0 z-20 opacity-30"
        style={{
          background: `radial-gradient(1000px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(200,200,200,0.15), transparent 60%)`,
        }}
      />

      {/* NAVEGACIÓN */}
      <nav className="fixed top-0 w-full bg-[#FFFEFC]/80 backdrop-blur-xl border-b border-neutral-200/50 z-50 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex items-center space-x-2 font-semibold text-lg tracking-tight cursor-pointer group">
            <div className="w-7 h-7 bg-neutral-900 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <span>Manager<span className="text-neutral-400">.</span></span>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex items-center space-x-4 text-sm font-medium">
            <Link to="/login" className="text-neutral-600 hover:text-neutral-900 transition-colors px-4 py-2 rounded-full hover:bg-neutral-100">
              Iniciar sesión
            </Link>
            <Link to="/register" className="px-5 py-2.5 bg-neutral-900 text-white rounded-full hover:bg-neutral-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
              <span className="relative z-10">Probar gratis</span>
              {/* Un pequeño destello en el botón al pasar el ratón */}
              <div className="absolute inset-0 h-full w-full scale-0 rounded-full group-hover:scale-150 group-hover:bg-white/10 transition-all duration-500 ease-out"></div>
            </Link>
          </motion.div>
        </div>
      </nav>

      <main className="pt-32 pb-24 relative z-40">
        
        {/* EL HÉROE */}
        <div className="max-w-4xl mx-auto px-6 text-center">
          
          {/* Etiqueta superior pequeña */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
            className="inline-flex items-center px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 mb-8"
          >
            <Sparkles className="w-3.5 h-3.5 mr-2 text-neutral-500" />
            <span className="text-xs font-medium text-neutral-600 uppercase tracking-wider">Espacio de trabajo inteligente</span>
          </motion.div>
          
          {/* Título animado palabra por palabra */}
          <AnimatedText 
            text="Pon orden en tu negocio. Trabaja con claridad absoluta."
            className="text-5xl md:text-7xl font-bold tracking-tight text-neutral-900 mb-8 leading-[1.05] max-w-3xl mx-auto"
          />
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg md:text-xl text-neutral-500 mb-12 max-w-xl mx-auto leading-relaxed font-light"
          >
            Un sistema minimalista que conecta clientes, tareas y finanzas. Con un agente de IA que te ayuda a pensar, no solo a ejecutar.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
          >
            {/* Botón magnético principal */}
            <Link to="/register" className="group relative w-full sm:w-auto px-8 py-4 bg-neutral-900 text-white rounded-2xl font-medium overflow-hidden transition-all hover:shadow-xl hover:shadow-neutral-900/20 hover:-translate-y-1">
               <span className="relative z-10 flex items-center justify-center">
                 Comenzar mi espacio <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
               </span>
            </Link>
            <Link to="/login" className="group w-full sm:w-auto px-8 py-4 bg-white text-neutral-700 border border-neutral-200 rounded-2xl font-medium hover:bg-neutral-50 transition-all hover:-translate-y-0.5">
              Ver demostración
            </Link>
          </motion.div>
        </div>

        {/* EL ESCAPARATE MINIMALISTA (Con entrada profunda) */}
        <motion.div 
          variants={deepFadeUp} initial="hidden" animate="visible" transition={{ delay: 1 }}
          className="max-w-5xl mx-auto px-6 mt-24"
        >
          <div className="relative bg-white rounded-[2rem] border border-neutral-200/80 shadow-2xl shadow-neutral-900/5 overflow-hidden flex flex-col md:flex-row h-auto md:h-[450px] transform-gpu perspective-1000 hover:scale-[1.01] transition-transform duration-500">
            {/* Reflejo sutil en el cristal */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

            {/* Sidebar falso */}
            <div className="w-full md:w-64 bg-[#FAFAF9] border-r border-neutral-200 p-6 flex flex-col space-y-6 relative z-10">
              <div className="flex space-x-1.5 absolute top-4 left-4">
                <div className="w-3 h-3 rounded-full bg-neutral-200"></div>
                <div className="w-3 h-3 rounded-full bg-neutral-200"></div>
                <div className="w-3 h-3 rounded-full bg-neutral-200"></div>
              </div>
              <div className="h-4 w-24 bg-neutral-200/80 rounded-md mt-8 mb-6"></div>
              <div className="space-y-4 opacity-70">
                <div className="flex items-center space-x-3 text-neutral-400"><BookOpen className="w-4 h-4" /><div className="h-3 w-20 bg-neutral-200 rounded-sm"></div></div>
                <div className="flex items-center space-x-3 text-neutral-900 font-medium bg-white py-2 px-3 rounded-lg shadow-sm -mx-3"><CheckSquare className="w-4 h-4" /><div className="h-3 w-16 bg-neutral-300 rounded-sm"></div></div>
                <div className="flex items-center space-x-3 text-neutral-400"><LineChart className="w-4 h-4" /><div className="h-3 w-24 bg-neutral-200 rounded-sm"></div></div>
              </div>
            </div>
            {/* Contenido falso */}
            <div className="flex-1 p-8 bg-white flex flex-col relative z-10">
              <div className="h-6 w-48 bg-neutral-100 rounded-md mb-10"></div>
              <div className="space-y-8 flex-1">
                <div className="flex space-x-4">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 flex-shrink-0 border border-neutral-200"></div>
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 w-3/4 bg-neutral-100 rounded-sm animate-pulse"></div>
                    <div className="h-3 w-1/2 bg-neutral-100 rounded-sm animate-pulse" style={{ animationDelay: '100ms' }}></div>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <div className="w-8 h-8 rounded-md bg-neutral-900 flex items-center justify-center flex-shrink-0 shadow-sm"><Terminal className="w-4 h-4 text-white" /></div>
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 w-full bg-neutral-100 rounded-sm"></div>
                    <div className="h-3 w-5/6 bg-neutral-100 rounded-sm"></div>
                    <div className="h-3 w-4/6 bg-neutral-100 rounded-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CARACTERÍSTICAS (Animadas al hacer scroll) */}
        <div ref={featuresRef} className="max-w-5xl mx-auto px-6 mt-40">
          <motion.div 
            variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
            initial="hidden"
            animate={mainControls}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-20"
          >
            
            {[
              { icon: Terminal, title: "Tu agente personal", desc: "No es un chatbot genérico. Es un asistente que conoce tu contexto y te ayuda a redactar respuestas y tomar decisiones." },
              { icon: BookOpen, title: "Directorio conectado", desc: "Un registro limpio. Cada cliente tiene su propia página con su historial de tareas y pagos. Todo conectado, nada perdido." },
              { icon: CheckSquare, title: "Foco en las tareas", desc: "Captura lo que tienes que hacer, asígnalo a un proyecto y márcalo como completado. Sin distracciones." },
              { icon: LineChart, title: "Claridad financiera", desc: "Registra ingresos y gastos sin fricción. Visualiza tu beneficio neto al instante sin pelearte con hojas de cálculo." }
            ].map((feature, idx) => (
              <motion.div key={idx} variants={deepFadeUp} className="space-y-4 group">
                <div className="w-12 h-12 rounded-xl bg-neutral-50 flex items-center justify-center border border-neutral-200 group-hover:border-neutral-300 group-hover:bg-white transition-colors duration-300 shadow-sm">
                  <feature.icon className="w-5 h-5 text-neutral-700 group-hover:text-neutral-900 transition-colors" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-neutral-900">{feature.title}</h3>
                <p className="text-neutral-500 leading-relaxed font-light group-hover:text-neutral-600 transition-colors">
                  {feature.desc}
                </p>
              </motion.div>
            ))}

          </motion.div>
        </div>

        {/* FOOTER */}
        <div className="max-w-3xl mx-auto px-6 mt-40 mb-10 text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="py-20 border-t border-neutral-200"
          >
            <h2 className="text-3xl font-bold tracking-tight mb-6">Empieza a trabajar con claridad.</h2>
            <Link to="/register" className="inline-flex px-8 py-4 bg-neutral-900 text-white rounded-2xl font-medium hover:bg-neutral-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              Crear cuenta gratuita
            </Link>
            <p className="text-neutral-400 mt-8 text-sm font-light">© {new Date().getFullYear()} AI Manager. Hecho con intención.</p>
          </motion.div>
        </div>

      </main>
    </div>
  );
}