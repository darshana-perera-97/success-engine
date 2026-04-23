import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Search, Check, CheckCheck, Eye, Lock, MessageCircle } from "lucide-react";
import { STUDENTS, EMPLOYEES } from "../constants";
import { Button } from "./Button";
const ChatInterface = ({ currentRole, currentUser, messages, onSendMessage }) => {
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [inputText, setInputText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isWaitingForReply, setIsWaitingForReply] = useState(false);
  const messagesEndRef = useRef(null);
  const getConversations = () => {
    if (currentRole === "Student") {
      const student = currentUser;
      const counselor = EMPLOYEES.find((e) => e.id === student.counselor);
      return counselor ? [counselor] : [];
    } else if (currentRole === "Counselor") {
      const counselor = currentUser;
      return STUDENTS.filter((s) => s.counselor === counselor.id);
    } else {
      return STUDENTS;
    }
  };
  const conversationList = getConversations().filter(
    (u) => u.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    const lastMsgA = messages.filter((m) => m.senderId === a.id || m.receiverId === a.id).sort((m1, m2) => new Date(m2.timestamp).getTime() - new Date(m1.timestamp).getTime())[0];
    const lastMsgB = messages.filter((m) => m.senderId === b.id || m.receiverId === b.id).sort((m1, m2) => new Date(m2.timestamp).getTime() - new Date(m1.timestamp).getTime())[0];
    if (!lastMsgA) return 1;
    if (!lastMsgB) return -1;
    return new Date(lastMsgB.timestamp).getTime() - new Date(lastMsgA.timestamp).getTime();
  });
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages, selectedConversationId]);
  const activeConversationId = selectedConversationId || conversationList[0]?.id;
  const getActiveMessages = () => {
    if (!activeConversationId) return [];
    const otherUserId = activeConversationId;
    const myId = currentUser.id;
    if (currentRole === "Manager" || currentRole === "Admin") {
      const selectedStudent = STUDENTS.find((s) => s.id === otherUserId);
      if (!selectedStudent) return [];
      const counselorId = selectedStudent.counselor;
      return messages.filter(
        (m) => m.senderId === selectedStudent.id && m.receiverId === counselorId || m.senderId === counselorId && m.receiverId === selectedStudent.id
      ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } else {
      return messages.filter(
        (m) => m.senderId === myId && m.receiverId === otherUserId || m.senderId === otherUserId && m.receiverId === myId
      ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }
  };
  const activeMessages = getActiveMessages();
  const activeUser = conversationList.find((u) => u.id === activeConversationId);
  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversationId) return;
    const text = inputText;
    setInputText("");
    onSendMessage(text, activeConversationId);
    setIsWaitingForReply(true);
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setIsWaitingForReply(false);
      }, 3e3);
    }, 1500);
  };
  const isGhostMode = currentRole === "Manager" || currentRole === "Admin";
  return /* @__PURE__ */ jsxs("div", { className: "h-[calc(100vh-140px)] bg-white border border-gray-200 rounded-xl shadow-sm flex overflow-hidden animate-in fade-in duration-500", children: [
    /* @__PURE__ */ jsxs("div", { className: "w-80 border-r border-gray-200 flex flex-col bg-gray-50/50", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-4 border-b border-gray-200 bg-white", children: [
        /* @__PURE__ */ jsxs("h2", { className: "font-bold text-slate-900 mb-3 flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { children: "Inbox" }),
          isGhostMode && /* @__PURE__ */ jsxs("span", { className: "text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-full flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(Eye, { size: 10 }),
            " Ghost Mode"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-2.5 text-gray-400", size: 16 }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              placeholder: "Search chats...",
              className: "w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
              value: searchTerm,
              onChange: (e) => setSearchTerm(e.target.value)
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto", children: conversationList.map((user) => {
        const relatedMsgs = messages.filter(
          (m) => m.senderId === user.id || m.receiverId === user.id
        ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const lastMsg = relatedMsgs[0];
        const isSelected = activeConversationId === user.id;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            onClick: () => setSelectedConversationId(user.id),
            className: `p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-white
                                    ${isSelected ? "bg-white border-l-4 border-l-indigo-600 shadow-sm" : "border-l-4 border-l-transparent text-slate-600"}
                                `,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-1", children: [
                /* @__PURE__ */ jsx("span", { className: `font-semibold text-sm ${isSelected ? "text-indigo-900" : "text-slate-900"}`, children: user.name }),
                lastMsg && /* @__PURE__ */ jsx("span", { className: "text-[10px] text-slate-400", children: new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 truncate h-4", children: lastMsg ? lastMsg.content : /* @__PURE__ */ jsx("span", { className: "italic text-slate-400", children: "No messages yet" }) }),
              isGhostMode && "counselor" in user && /* @__PURE__ */ jsxs("div", { className: "mt-2 text-[10px] text-slate-400 flex items-center gap-1", children: [
                /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-emerald-500" }),
                "Agent: ",
                user.counselor
              ] })
            ]
          },
          user.id
        );
      }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col bg-white relative", children: [
      /* @__PURE__ */ jsxs("div", { className: "h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white z-10", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden", children: activeUser && "avatar" in activeUser && activeUser.avatar ? /* @__PURE__ */ jsx("img", { src: activeUser.avatar, alt: activeUser.name, className: "w-full h-full object-cover", referrerPolicy: "no-referrer" }) : activeUser?.name.charAt(0) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "font-bold text-slate-900 text-sm", children: activeUser?.name }),
            activeUser && "country" in activeUser ? /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500 flex items-center gap-1", children: [
              "Student \u2022 ",
              activeUser.country
            ] }) : /* @__PURE__ */ jsxs("p", { className: "text-xs text-emerald-600 flex items-center gap-1", children: [
              /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" }),
              " Online"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-gray-100", children: [
          /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-green-500" }),
          "WhatsApp Synced"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto p-6 space-y-6 bg-[#F8FAFC]", children: [
        activeMessages.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center h-full text-slate-400", children: [
          /* @__PURE__ */ jsx(MessageCircle, { size: 48, className: "mb-4 text-slate-300" }),
          /* @__PURE__ */ jsx("p", { children: "No messages yet." }),
          /* @__PURE__ */ jsx("p", { className: "text-xs", children: "Start the conversation!" })
        ] }) : activeMessages.map((msg) => {
          let isMe = false;
          if (isGhostMode) {
            isMe = msg.senderId.startsWith("EMP");
          } else {
            isMe = msg.senderId === currentUser.id;
          }
          return /* @__PURE__ */ jsx("div", { className: `flex ${isMe ? "justify-end" : "justify-start"}`, children: /* @__PURE__ */ jsxs("div", { className: `max-w-[70%] rounded-2xl p-4 shadow-sm relative ${isMe ? "bg-indigo-600 text-white rounded-br-none" : "bg-white border border-gray-200 text-slate-800 rounded-bl-none"}`, children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed", children: msg.content }),
            /* @__PURE__ */ jsxs("div", { className: `flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? "text-indigo-200" : "text-slate-400"}`, children: [
              msg.platform === "whatsapp" && !isMe && /* @__PURE__ */ jsx("span", { className: "mr-1 font-bold text-green-600 bg-green-50 px-1 rounded", children: "WA" }),
              new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              isMe && (msg.read ? /* @__PURE__ */ jsx(CheckCheck, { size: 12 }) : /* @__PURE__ */ jsx(Check, { size: 12 }))
            ] })
          ] }) }, msg.id);
        }),
        isTyping && /* @__PURE__ */ jsx("div", { className: "flex justify-start", children: /* @__PURE__ */ jsxs("div", { className: "bg-white border border-gray-200 rounded-2xl p-3 shadow-sm rounded-bl-none flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" }),
          /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" }),
          /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" })
        ] }) }),
        isWaitingForReply && !isTyping && /* @__PURE__ */ jsx("div", { className: "flex justify-start", children: /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-slate-400 font-medium flex items-center gap-1 ml-2", children: [
          /* @__PURE__ */ jsx("span", { className: "w-1 h-1 rounded-full bg-slate-400 animate-pulse" }),
          "Waiting for reply..."
        ] }) }),
        /* @__PURE__ */ jsx("div", { ref: messagesEndRef })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "p-4 border-t border-gray-200 bg-white", children: isGhostMode ? /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-center gap-2 text-slate-500 text-sm", children: [
        /* @__PURE__ */ jsx(Lock, { size: 16 }),
        /* @__PURE__ */ jsx("span", { children: "Ghost Mode Active: Monitoring Only" })
      ] }) : /* @__PURE__ */ jsxs("form", { onSubmit: handleSend, className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("button", { type: "button", className: "p-2 text-slate-400 hover:text-slate-600 transition-colors", children: /* @__PURE__ */ jsx(Paperclip, { size: 20 }) }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: inputText,
            onChange: (e) => setInputText(e.target.value),
            placeholder: "Type a message...",
            className: "flex-1 py-2.5 px-4 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
          }
        ),
        /* @__PURE__ */ jsx(Button, { type: "submit", className: "rounded-full w-10 h-10 p-0 flex items-center justify-center", disabled: !inputText.trim(), children: /* @__PURE__ */ jsx(Send, { size: 18, className: "ml-0.5" }) })
      ] }) })
    ] })
  ] });
};
export {
  ChatInterface
};
