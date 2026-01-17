import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

interface Conversation {
  id: string;
  doctor_id: string;
  doctor_name: string;
}

interface ChatSectionProps {
  isRTL: boolean;
  clientId: string;
}

export const ChatSection = ({ isRTL, clientId }: ChatSectionProps) => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversation();
  }, [clientId]);

  useEffect(() => {
    if (conversation) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [conversation?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const fetchConversation = async () => {
    try {
      // First get the client assignment to find the doctor
      const { data: assignment, error: assignmentError } = await supabase
        .from('client_assignments')
        .select('doctor_id')
        .eq('client_id', clientId)
        .eq('status', 'active')
        .single();

      if (assignmentError || !assignment) {
        setLoading(false);
        return;
      }

      // Get doctor profile
      const { data: doctorProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', assignment.doctor_id)
        .single();

      // Check if conversation exists
      let { data: existingConv } = await supabase
        .from('conversations')
        .select('id, doctor_id')
        .eq('client_id', clientId)
        .eq('doctor_id', assignment.doctor_id)
        .single();

      if (!existingConv) {
        // Create new conversation
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            client_id: clientId,
            doctor_id: assignment.doctor_id
          })
          .select()
          .single();

        if (createError) throw createError;
        existingConv = newConv;
      }

      setConversation({
        id: existingConv.id,
        doctor_id: existingConv.doctor_id,
        doctor_name: doctorProfile?.full_name || (isRTL ? 'الطبيب' : 'Doctor')
      });
    } catch (error) {
      console.error('Error fetching conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!conversation) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data || []);
  };

  const subscribeToMessages = () => {
    if (!conversation) return;

    const channel = supabase
      .channel(`messages-${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !conversation) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: clientId,
          content: newMessage.trim()
        });

      if (error) throw error;

      // Update last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversation.id);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(isRTL ? 'حدث خطأ في إرسال الرسالة' : 'Error sending message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[400px] text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
          <MessageCircle className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {isRTL ? 'المحادثات' : 'Chat'}
        </h2>
        <p className="text-muted-foreground max-w-md">
          {isRTL ? 'لم يتم تعيين طبيب لك بعد' : 'No doctor assigned to you yet'}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-[calc(100vh-180px)]"
    >
      {/* Header */}
      <div className={`mb-4 ${isRTL ? 'text-right' : ''}`}>
        <h1 className="text-2xl font-bold">{isRTL ? 'المحادثات' : 'Chat'}</h1>
        <p className="text-muted-foreground">
          {isRTL ? 'تواصل مع طبيبك مباشرة' : 'Chat directly with your doctor'}
        </p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col bg-card border border-border rounded-xl overflow-hidden">
        {/* Doctor Header */}
        <div className="bg-primary/80 p-4 flex items-center gap-3" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
          <div className="w-10 h-10 rounded-full bg-background/20 flex items-center justify-center">
            <User className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-bold text-primary-foreground">{isRTL ? 'الطبيب' : 'Doctor'}</p>
            <p className="text-sm text-primary-foreground/80">{conversation.doctor_name}</p>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                {isRTL ? 'ابدأ المحادثة مع طبيبك' : 'Start a conversation with your doctor'}
              </div>
            ) : (
              messages.map((message) => {
                const isMe = message.sender_id === clientId;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isMe ? (isRTL ? 'justify-start' : 'justify-end') : (isRTL ? 'justify-end' : 'justify-start')}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isMe
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className={isRTL ? 'text-right' : ''}>{message.content}</p>
                      <p className={`text-xs mt-1 opacity-70 ${isRTL ? 'text-right' : ''}`}>
                        {format(new Date(message.created_at), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isRTL ? 'اكتب رسالتك...' : 'Type your message...'}
              className={`flex-1 ${isRTL ? 'text-right' : ''}`}
              disabled={sending}
            />
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              size="icon"
            >
              <Send className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
