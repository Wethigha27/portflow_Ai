import React, { useState, useRef, useEffect } from 'react';
import AdminHubLayout from '@/components/AdminHub/Layout';

const contactsMock = [
  {
    id: 1,
    name: "Nancy Fernandez",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    lastMessage: "Hi Jordan! Feels like ",
    date: "1 min",
    status: 'online',
  },
  {
    id: 2,
    name: "Jonathan Griffin",
    avatar: "https://randomuser.me/api/portraits/men/34.jpg",
    lastMessage: "Super! I will get...",
    date: "1 min",
    status: 'offline',
  },
  {
    id: 3,
    name: "Gertrude Weber",
    avatar: "https://randomuser.me/api/portraits/women/39.jpg",
    lastMessage: "Living in the now use...",
    date: "2 min",
    status: 'online',
  },
];

// Message author is either 'me' or the contact's name
const mockMessages = [
  {
    author: "Nancy Fernandez",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    content: "Hi Jordan! Feels like it's been a while! How are you? Do you have any time for the remainder of the week to help me with an ongoing project?",
    date: '11:48 AM',
  },
  {
    author: "me",
    content: "Hi Nancy, glad to hear from you, I'm fine. What about you? And how is it going with the Velocity website? Of course, I will help with this project 😊",
    date: '11:49 AM',
  },
  {
    author: "Nancy Fernandez",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    content: "Super, I will get you the new brief for our own site over to you this evening, so you have time to read over I'm good thank you! 😊",
    date: '11:50 AM',
  },
  {
    author: "me",
    content: "Of course I can, just catching up with Steve on it and I'll write it out. Speak tomorrow! Let me know if you have any questions!",
    date: '11:51 AM',
    attachment: 'A_Project_guide.pdf',
  },
];

const bubbleColors = {
  me: '#443ee9',
  other: '#f6f7fb',
};

const MerchantMessages = () => {
  const [selectedContact, setSelectedContact] = useState(contactsMock[0]);
  const [messages, setMessages] = useState(mockMessages);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom on new message
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages([...messages, {
        author: 'me',
        content: input,
        date: (new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setInput('');
    }
  };

  return (
    <AdminHubLayout userType="merchant">
      <div style={{ display: 'flex', height: '100vh', background: '#fafbfe', fontFamily: 'Inter, sans-serif' }}>
        {/* Sidebar contacts */}
        <aside style={{ width: 320, borderRight: '1px solid #eef0f3', background: 'white', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 24, paddingBottom: 14, borderBottom: '1px solid #eef0f3' }}>
            <input style={{ width: '100%', borderRadius: 16, border: '1px solid #eef0f3', padding: '8px 16px', fontSize: 15, background: '#f7f8fa' }} placeholder="Search" />
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {contactsMock.map(ct => (
              <div
                key={ct.id}
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px', cursor: 'pointer', background: selectedContact.id === ct.id ? '#eef0fa' : undefined, borderRight: selectedContact.id === ct.id ? '3px solid #443ee9' : 'none' }}
                onClick={() => setSelectedContact(ct)}
              >
                <span style={{ position: 'relative' }}>
                  <img src={ct.avatar} alt={ct.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 2px 6px #0001' }} />
                  <span style={{ position: 'absolute', right: 0, bottom: 0, width: 12, height: 12, borderRadius: 999, background: ct.status === 'online' ? '#19c37d' : '#dedede', border: '2px solid #fff' }} />
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 3 }}>{ct.name}</div>
                  <div style={{ fontSize: 13, color: '#8190a5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 130 }}>{ct.lastMessage}</div>
                </div>
                <div style={{ fontSize: 12, color: '#b5bece', marginLeft: 5 }}>{ct.date}</div>
              </div>
            ))}
          </div>
        </aside>

        {/* Central chat area */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
          {/* Header */}
          <div style={{ padding: '16px 32px', borderBottom: '1px solid #eef0f3', background: 'white', display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={selectedContact.avatar} alt={selectedContact.name} style={{ width: 44, height: 44, borderRadius: '50%' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 17 }}>{selectedContact.name}</div>
              <div style={{ fontSize: 12, color: '#19c37d' }}>{selectedContact.status === 'online' ? 'Online' : 'Offline'}</div>
            </div>
          </div>
          {/* Chat body */}
          <div ref={scrollRef} style={{ flex: 1, padding: 34, background: '#fafbfe', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {messages.map((msg, i) => {
              const isMe = msg.author === 'me';
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-end', flexDirection: isMe ? 'row-reverse' : 'row', gap: 10 }}>
                  {/* Avatar */}
                  {!isMe && (
                    <img src={selectedContact.avatar} alt="avatar" style={{ width: 36, height: 36, borderRadius: '50%', boxShadow: '0 1px 4px #0001' }} />
                  )}
                  {/* Bubble */}
                  <div style={{
                    background: isMe ? bubbleColors.me : bubbleColors.other,
                    color: isMe ? 'white' : '#23253a',
                    borderRadius: 20,
                    padding: '10px 18px',
                    fontSize: 15,
                    maxWidth: 340,
                    minWidth: 60,
                    boxShadow: isMe ? '0 2px 10px #443ee93c' : '0 1px 2px #aeb3d024',
                    textAlign: 'left',
                    marginLeft: isMe ? 48 : 0,
                    marginRight: !isMe ? 48 : 0,
                    wordBreak: 'break-word',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    {msg.content}
                    {msg.attachment &&
                      <div style={{ marginTop: 6 }}>
                        <a href="#" style={{ fontSize: 13, color: isMe ? '#d1dbfc' : '#6066b3', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span role="img" aria-label="attachment">📎</span> {msg.attachment}
                        </a>
                      </div>
                    }
                    <span style={{ display: 'block', textAlign: 'right', fontSize: 11, marginTop: 2, color: isMe ? '#e7eaff' : '#b2b6c5' }}>{msg.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Composer */}
          <form onSubmit={handleSend} style={{ borderTop: '1px solid #eef0f3', background: 'white', padding: '18px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <button type="button" style={{ background: '#f6f7fa', border: 'none', borderRadius: 999, width: 38, height: 38, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', fontSize: 21, color: '#aeb3c5' }}>
              <span role="img" aria-label="Add file">📎</span>
            </button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Write your message…"
              style={{ flex: 1, padding: '13px 18px', borderRadius: 26, border: '1px solid #e5e7ef', fontSize: 15, background: '#f6f7fa', outline: 'none' }}
            />
            <button type="submit" style={{ border: 'none', borderRadius: 999, background: '#443ee9', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg style={{ width: 20, height: 20, fill: 'white', rotate: '45deg' }} viewBox="0 0 24 24"><path d="M2 21l21-9-21-9v7l15 2-15 2v7z" /></svg>
            </button>
          </form>
        </main>

        {/* (Optional) Right action area */}
        <aside style={{ width: 74, borderLeft: '1px solid #eef0f3', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0' }}>
          <button style={{ background: 'none', border: 'none', margin: '18px 0', cursor: 'pointer' }} title="All files">
            <svg fill="#bbb" width="28" height="28" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 11h8v2H8z"/></svg>
          </button>
          <button style={{ background: 'none', border: 'none', margin: '18px 0', cursor: 'pointer' }} title="Delete conversation">
            <svg fill="#bbb" width="28" height="28" viewBox="0 0 24 24"><rect x="5" y="6" width="14" height="2"/><rect x="7" y="9" width="10" height="10"/></svg>
          </button>
        </aside>
      </div>
    </AdminHubLayout>
  );
};

export default MerchantMessages;
