import React, { useState, useEffect, useRef } from 'react';
import { Message, UserRole, Student, Employee } from '../types';
import { Send, Paperclip, Search, Check, CheckCheck, Eye, Lock, MessageCircle } from 'lucide-react';
import { STUDENTS, EMPLOYEES } from '../constants';
import { Button } from './Button';

interface ChatInterfaceProps {
    currentRole: UserRole;
    currentUser: Student | Employee; // Simplified prop for current user context
    messages: Message[];
    onSendMessage: (text: string, receiverId: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ currentRole, currentUser, messages, onSendMessage }) => {
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [inputText, setInputText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isWaitingForReply, setIsWaitingForReply] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // --- Logic: Resolve Conversation List ---
    // Returns a list of users the current user can chat with
    const getConversations = () => {
        if (currentRole === 'Student') {
            // Student sees their Counselor
            const student = currentUser as Student;
            const counselor = EMPLOYEES.find(e => e.id === student.counselor);
            return counselor ? [counselor] : [];
        } else if (currentRole === 'Counselor') {
            // Counselor sees their assigned Students
            const counselor = currentUser as Employee;
            return STUDENTS.filter(s => s.counselor === counselor.id);
        } else {
            // Manager/Admin sees ALL Students (Ghost Mode)
            return STUDENTS;
        }
    };

    const conversationList = getConversations().filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
        const lastMsgA = messages.filter(m => m.senderId === a.id || m.receiverId === a.id).sort((m1, m2) => new Date(m2.timestamp).getTime() - new Date(m1.timestamp).getTime())[0];
        const lastMsgB = messages.filter(m => m.senderId === b.id || m.receiverId === b.id).sort((m1, m2) => new Date(m2.timestamp).getTime() - new Date(m1.timestamp).getTime())[0];
        if (!lastMsgA) return 1;
        if (!lastMsgB) return -1;
        return new Date(lastMsgB.timestamp).getTime() - new Date(lastMsgA.timestamp).getTime();
    });

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, [messages, selectedConversationId]);

    const activeConversationId = selectedConversationId || conversationList[0]?.id;

    // --- Logic: Resolve Active Chat Messages ---
    const getActiveMessages = () => {
        if (!activeConversationId) return [];

        const otherUserId = activeConversationId;
        const myId = currentUser.id;

        if (currentRole === 'Manager' || currentRole === 'Admin') {
            // Ghost Mode: See messages between Selected Student AND their Counselor
            const selectedStudent = STUDENTS.find(s => s.id === otherUserId);
            if (!selectedStudent) return [];
            const counselorId = selectedStudent.counselor;
            
            return messages.filter(m => 
                (m.senderId === selectedStudent.id && m.receiverId === counselorId) ||
                (m.senderId === counselorId && m.receiverId === selectedStudent.id)
            ).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        } else {
            // Standard Mode: See messages between Me AND Selected User
            return messages.filter(m => 
                (m.senderId === myId && m.receiverId === otherUserId) ||
                (m.senderId === otherUserId && m.receiverId === myId)
            ).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        }
    };

    const activeMessages = getActiveMessages();
    const activeUser = conversationList.find(u => u.id === activeConversationId);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !activeConversationId) return;
        
        const text = inputText;
        setInputText('');
        onSendMessage(text, activeConversationId);
        
        // Demo: Simulate waiting for reply and typing
        setIsWaitingForReply(true);
        setTimeout(() => {
            setIsTyping(true);
            setTimeout(() => {
                setIsTyping(false);
                setIsWaitingForReply(false);
            }, 3000);
        }, 1500);
    };

    const isGhostMode = currentRole === 'Manager' || currentRole === 'Admin';

    return (
        <div className="h-[calc(100vh-140px)] bg-white border border-gray-200 rounded-xl shadow-sm flex overflow-hidden animate-in fade-in duration-500">
            {/* Sidebar: Conversation List */}
            <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50/50">
                <div className="p-4 border-b border-gray-200 bg-white">
                    <h2 className="font-bold text-slate-900 mb-3 flex items-center justify-between">
                        <span>Inbox</span>
                        {isGhostMode && (
                            <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Eye size={10} /> Ghost Mode
                            </span>
                        )}
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search chats..." 
                            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    {conversationList.map(user => {
                        // Find last message for preview
                        const relatedMsgs = messages.filter(m => 
                            m.senderId === user.id || m.receiverId === user.id
                        ).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                        const lastMsg = relatedMsgs[0];
                        const isSelected = activeConversationId === user.id;

                        return (
                            <div 
                                key={user.id}
                                onClick={() => setSelectedConversationId(user.id)}
                                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-white
                                    ${isSelected ? 'bg-white border-l-4 border-l-indigo-600 shadow-sm' : 'border-l-4 border-l-transparent text-slate-600'}
                                `}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`font-semibold text-sm ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>{user.name}</span>
                                    {lastMsg && <span className="text-[10px] text-slate-400">{new Date(lastMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
                                </div>
                                <p className="text-xs text-slate-500 truncate h-4">
                                    {lastMsg ? lastMsg.content : <span className="italic text-slate-400">No messages yet</span>}
                                </p>
                                {isGhostMode && 'counselor' in user && (
                                    <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        Agent: {(user as Student).counselor}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white relative">
                {/* Header */}
                <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden">
                            {activeUser && 'avatar' in activeUser && activeUser.avatar ? (
                                <img src={activeUser.avatar} alt={activeUser.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                                activeUser?.name.charAt(0)
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm">{activeUser?.name}</h3>
                            {activeUser && 'country' in activeUser ? (
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                    Student • {(activeUser as Student).country}
                                </p>
                            ) : (
                                <p className="text-xs text-emerald-600 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
                                </p>
                            )}
                        </div>
                    </div>
                    {/* Visual cue for Omni-Channel */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-gray-100">
                         <div className="w-2 h-2 rounded-full bg-green-500"></div>
                         WhatsApp Synced
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F8FAFC]">
                    {activeMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <MessageCircle size={48} className="mb-4 text-slate-300" />
                            <p>No messages yet.</p>
                            <p className="text-xs">Start the conversation!</p>
                        </div>
                    ) : (
                        activeMessages.map((msg) => {
                            // Determine alignment
                            // If Ghost Mode: Student is Left (White), Counselor is Right (Indigo)
                            // If Normal Mode: Me is Right, Other is Left
                            let isMe = false;
                            
                            if (isGhostMode) {
                                // Right if Counselor sent it
                                isMe = msg.senderId.startsWith('EMP');
                            } else {
                                isMe = msg.senderId === currentUser.id;
                            }

                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm relative ${
                                        isMe 
                                        ? 'bg-indigo-600 text-white rounded-br-none' 
                                        : 'bg-white border border-gray-200 text-slate-800 rounded-bl-none'
                                    }`}>
                                        <p className="text-sm leading-relaxed">{msg.content}</p>
                                        <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                                            {/* WhatsApp Indicator */}
                                            {msg.platform === 'whatsapp' && !isMe && (
                                                <span className="mr-1 font-bold text-green-600 bg-green-50 px-1 rounded">WA</span>
                                            )}
                                            {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            {isMe && (
                                                msg.read ? <CheckCheck size={12} /> : <Check size={12} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm rounded-bl-none flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                    
                    {isWaitingForReply && !isTyping && (
                        <div className="flex justify-start">
                            <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 ml-2">
                                <span className="w-1 h-1 rounded-full bg-slate-400 animate-pulse"></span>
                                Waiting for reply...
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 bg-white">
                    {isGhostMode ? (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-center gap-2 text-slate-500 text-sm">
                            <Lock size={16} />
                            <span>Ghost Mode Active: Monitoring Only</span>
                        </div>
                    ) : (
                        <form onSubmit={handleSend} className="flex items-center gap-3">
                            <button type="button" className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                                <Paperclip size={20} />
                            </button>
                            <input 
                                type="text" 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 py-2.5 px-4 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                            />
                            <Button type="submit" className="rounded-full w-10 h-10 p-0 flex items-center justify-center" disabled={!inputText.trim()}>
                                <Send size={18} className="ml-0.5" />
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};