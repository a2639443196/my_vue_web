import { useState, useRef, useEffect } from "react";
import { TopNav } from "../components/TopNav";
import { Send, Users } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

interface Message {
  id: number;
  user: string;
  content: string;
  time: string;
  isOwn: boolean;
  avatar: string;
}

export function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      user: "小明",
      content: "大家好！今天的喝水目标完成了吗？",
      time: "10:23",
      isOwn: false,
      avatar: "👨"
    },
    {
      id: 2,
      user: "彦祖",
      content: "完成了！今天喝了2.1L水",
      time: "10:25",
      isOwn: true,
      avatar: "🧑"
    },
    {
      id: 3,
      user: "小红",
      content: "我也完成了，感觉皮肤都变好了",
      time: "10:28",
      isOwn: false,
      avatar: "👩"
    },
    {
      id: 4,
      user: "小明",
      content: "坚持下去，一起加油！💪",
      time: "10:30",
      isOwn: false,
      avatar: "👨"
    },
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSend = () => {
    if (!message.trim()) return;
    
    const newMessage: Message = {
      id: messages.length + 1,
      user: "彦祖",
      content: message,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      avatar: "🧑"
    };
    
    setMessages([...messages, newMessage]);
    setMessage("");
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <div className="min-h-screen bg-[rgb(var(--background))] flex flex-col">
      <TopNav title="聊天室" showBack showProfile />
      
      {/* Online Users */}
      <div className="px-6 py-3 bg-[rgb(var(--card))] border-b border-white/5">
        <div className="flex items-center gap-2 max-w-md mx-auto">
          <Users className="w-4 h-4 text-green-400" />
          <span className="text-sm text-secondary">
            12 人在线
          </span>
          <div className="flex -space-x-2 ml-auto">
            {['👨', '👩', '🧑', '👴', '👵'].map((avatar, i) => (
              <div 
                key={i}
                className="w-8 h-8 rounded-full bg-[rgb(var(--primary))]/20 border-2 border-[rgb(var(--background))] flex items-center justify-center"
              >
                {avatar}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 max-w-md mx-auto w-full">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex gap-3 ${msg.isOwn ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-[rgb(var(--primary))]/20 flex items-center justify-center flex-shrink-0">
                {msg.avatar}
              </div>
              
              {/* Message Bubble */}
              <div className={`flex flex-col max-w-[70%] ${msg.isOwn ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {!msg.isOwn && <span className="text-sm text-[rgb(var(--muted-foreground))]">{msg.user}</span>}
                  <span className="caption">{msg.time}</span>
                </div>
                <div 
                  className={`px-4 py-3 rounded-2xl ${
                    msg.isOwn 
                      ? 'bg-[rgb(var(--primary))] text-white rounded-tr-sm' 
                      : 'bg-[rgb(var(--card))] border border-white/5 rounded-tl-sm'
                  }`}
                >
                  <p>{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input Area */}
      <div className="sticky bottom-0 safe-bottom px-6 py-4 bg-[rgb(var(--card))] border-t border-white/5">
        <div className="max-w-md mx-auto flex gap-3">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息..."
            className="flex-1 h-12 bg-[rgb(var(--surface))] border-white/10"
          />
          <Button 
            onClick={handleSend}
            disabled={!message.trim()}
            className="h-12 w-12 gradient-primary p-0"
            size="icon"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}