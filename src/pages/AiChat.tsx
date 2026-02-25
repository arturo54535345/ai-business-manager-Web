import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, User, Sparkles } from 'lucide-react';
import { aiService } from '../services/ai.service';
import { useAuthStore } from '../stores/authStore';

//como sera un mensaje
interface Message {
    id: string;
    role: 'user' | 'ai';
    content: string;
}

export default function AiChat(){
    const {user} = useAuthStore();

    //enviare siempre un mensaje de bienvenida
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'ai',
            content: `¡Hola ${user?.name}! Soy tu AI Business Manager. Estoy analizando tus finanzas, clientes y tareas. ¿En qué puedo ayudarte a mejorar tu negocio hoy?`
        }
    ]);

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    //se hara scroll automatico a mediada que la conversacion aumente 
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    };

    //cada que cambian los mensajes bajo la pantalla
    useEffect(()=>{
        scrollToBottom();
    },[messages, isLoading]);

    const handleSubmit = async (e: React.FormEvent) =>{
        e.preventDefault();
        if(!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');//se limpiara la caja 

        //añado el mensaje del usuario a la pantalla
        const newUserMessage: Message = {id: Date.now().toString(), role: 'user', content: userMessage };
        setMessages((prev)=> [...prev, newUserMessage]);

        //enciendo el estado Pensando...
        setIsLoading(true);

        try{
            //hablo con el back
            const aiResponseText = await aiService.chat(userMessage);

            //añado la respuesta de la ia a la pantalla
            const newAiMessage: Message = {id: (Date.now() +1).toString(), role: 'ai', content: aiResponseText};
            setMessages((prev)=>[...prev, newAiMessage]);
        }catch(error){
            const errorMessage: Message ={
                id: (Date.now() +1).toString(),
                role: 'ai',
                content: 'Lo siente, he tenido un problema de conexion al procesar tu solicitud. ¿Podrías intentarlo de nuevo?'
            };
            setMessages((prev)=>[...prev, errorMessage]);
        }finally{
            setIsLoading(false);
        }
    };
    
        return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      
      {/* Cabecera del Chat */}
      <div className="bg-white rounded-t-2xl border border-gray-100 p-4 sm:p-6 shadow-sm flex items-center justify-between z-10 relative">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-inner">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center">
              Socio Estratégico IA <Sparkles className="w-4 h-4 text-yellow-500 ml-2" />
            </h1>
            <p className="text-sm text-green-600 font-medium flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              En línea y listo para analizar
            </p>
          </div>
        </div>
      </div>

      {/* Área de Mensajes (Donde ocurre la magia) */}
      <div className="flex-1 bg-gray-50/50 border-x border-gray-100 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-end space-x-2 max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
              
              {/* Avatar pequeñito */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-gray-200 text-gray-600' : 'bg-primary-100 text-primary-600'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Burbuja del Mensaje */}
              <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm sm:text-base ${
                msg.role === 'user' 
                  ? 'bg-gray-900 text-white rounded-br-sm' 
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
              }`}>
                {/* Usamos whitespace-pre-wrap para que respete los saltos de línea de la IA */}
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Indicador de "Escribiendo..." elegante */}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="flex items-end space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center space-x-1.5">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Caja de Texto (Input) */}
      <div className="bg-white rounded-b-2xl border border-gray-100 p-4 shadow-sm">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Pregúntame sobre tus finanzas, cómo priorizar tareas o redactar correos..."
            className="w-full pl-6 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all focus:bg-white disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition-colors shadow-md shadow-primary-500/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-3 font-medium">
          La IA tiene contexto sobre tus clientes, tareas y finanzas actuales.
        </p>
      </div>

    </div>
    )
}