import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

interface Conversation {
  id: string;
  client_id: string;
  client_name: string;
  last_message_at: string | null;
}

interface ChatSectionProps {
  isRTL: boolean;
  doctorId: string;
}

export const ChatSection = ({ isRTL, doctorId }: ChatSectionProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, [doctorId]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
      const unsubscribe = subscribeToMessages();
      return unsubscribe;
    }
  }, [selectedConversation?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const fetchConversations = async () => {
    try {
      const { data: convs, error } = await supabase
        .from('conversations')
        .select('id, client_id, last_message_at')
        .eq('doctor_id', doctorId)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      if (convs && convs.length > 0) {
        // Get client profiles
        const clientIds = convs.map(c => c.client_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', clientIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

        const enrichedConvs: Conversation[] = convs.map(c => ({
          id: c.id,
          client_id: c.client_id,
          client_name: profileMap.get(c.client_id) || (isRTL ? 'عميل' : 'Client'),
          last_message_at: c.last_message_at
        }));

        setConversations(enrichedConvs);
        if (enrichedConvs.length > 0) {
          setSelectedConversation(enrichedConvs[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedConversation) return;

    const { data, error } = await supabase
      .from('messages')
      .select('id, sender_id, content, created_at, read')
      .eq('conversation_id', selectedConversation.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data || []);
  };

  const subscribeToMessages = () => {
    if (!selectedConversation) return () => {};

    const channel = supabase
      .channel(`doctor-messages-${selectedConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation.id}`
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
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: doctorId,
          content: newMessage.trim()
        });

      if (error) throw error;

      // Update last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedConversation.id);

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

  if (conversations.length === 0) {
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
          {isRTL ? 'المحادثات' : 'Conversations'}
        </h2>
        <p className="text-muted-foreground max-w-md">
          {isRTL ? 'لا توجد محادثات بعد' : 'No conversations yet'}
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
        <h1 className="text-2xl font-bold">{isRTL ? 'المحادثات' : 'Conversations'}</h1>
        <p className="text-muted-foreground">
          {isRTL ? 'تواصل مع عملائك' : 'Chat with your clients'}
        </p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex bg-card border border-border rounded-xl overflow-hidden">
        {/* Conversations List */}
        <div className={cn(
          "w-64 border-border bg-muted/30 flex-shrink-0",
          isRTL ? "border-l" : "border-r"
        )}>
          <div className="p-3 border-b border-border">
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{isRTL ? 'العملاء' : 'Clients'}</span>
            </div>
          </div>
          <ScrollArea className="h-[calc(100%-50px)]">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={cn(
                  "w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors",
                  isRTL ? "flex-row-reverse text-right" : "",
                  selectedConversation?.id === conv.id && "bg-primary/10"
                )}
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{conv.client_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {conv.last_message_at ? format(new Date(conv.last_message_at), 'HH:mm') : ''}
                  </p>
                </div>
              </button>
            ))}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Client Header */}
              <div className="bg-primary/80 p-4 flex items-center gap-3" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                <div className="w-10 h-10 rounded-full bg-background/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-bold text-primary-foreground">{selectedConversation.client_name}</p>
                  <p className="text-sm text-primary-foreground/80">{isRTL ? 'عميل' : 'Client'}</p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      {isRTL ? 'ابدأ المحادثة مع العميل' : 'Start a conversation with your client'}
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isMe = message.sender_id === doctorId;
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
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              {isRTL ? 'اختر محادثة للبدء' : 'Select a conversation to start'}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};