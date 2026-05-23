'use client';

import { useState, useEffect, FormEvent } from "react";
import Image from "next/image";

interface EventData {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  type: string;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  institution: string;
  event_ids: string[];
}

interface AlertState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

export default function EventRegisterPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({ show: false, message: "", type: "success" });

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    institution: "",
    event_ids: [],
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("https://techstrota.tech/api/events", {
          headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) throw new Error("Failed to load events");
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error("Fetch Error:", err);
      }
    };
    fetchEvents();
  }, []);

  const handleEventToggle = (id: string) => {
    setForm(prev => {
      const isSelected = prev.event_ids.includes(id);
      return {
        ...prev,
        event_ids: isSelected 
          ? prev.event_ids.filter(eventId => eventId !== id)
          : [...prev.event_ids, id]
      };
    });
  };

  const handleNameChange = (val: string) => {
    if (/^[a-zA-Z\s]*$/.test(val)) setForm({ ...form, name: val });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.event_ids.length === 0) {
      setAlert({ show: true, message: "Please select at least one event", type: "error" });
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("https://techstrota.tech/api/event/register-multiple", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      
      setAlert({ show: true, message: "Successfully registered!", type: "success" });
      setForm({
        name: "", email: "", phone: "", institution: "",
        event_ids: []
      });
    } catch (err: any) {
      setAlert({ show: true, message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 py-12 px-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-30" />
      
      {alert.show && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center p-4 w-full max-w-xs rounded-xl shadow-2xl border ${alert.type === "success" ? "bg-green-600 border-green-700" : "bg-red-600 border-red-700"} text-white`}>
          <div className="text-sm font-bold">{alert.message}</div>
          <button onClick={() => setAlert(prev => ({ ...prev, show: false }))} className="ml-auto bg-white/20 p-1 rounded-md">✕</button>
        </div>
      )}

      <div className="relative z-10 w-full max-w-4xl space-y-8">
        
        {/* --- EVENT SELECTION SECTION --- */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-100">
          {/* Responsive Header: Column on mobile, Row on md+ screens */}
          <div className="flex flex-col md:flex-row md:justify-between items-center md:items-start gap-6 mb-8 text-center md:text-left">
            <Image 
              src="/TsLogo.png" 
              alt="Logo" 
              width={140} 
              height={50}
              priority 
              // Use 'style' to ensure aspect ratio is preserved without console warnings
              style={{ width: 'auto', height: 'auto' }} 
              className="object-contain md:order-2" // Order-2 moves logo to the right on desktop
            />
            <div className="md:order-1">
              <h1 className="text-2xl font-extrabold text-slate-900">Active Events</h1>
              <p className="text-slate-500 text-sm">Select the events you wish to participate in</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {events.length > 0 ? events.map(ev => {
              const isSelected = form.event_ids.includes(ev.id);

              const formatDate = (dateStr: string) => 
                new Date(dateStr).toLocaleDateString('en-GB', { 
                  day: 'numeric', 
                  month: 'short' 
                });
              
              return (
                <div 
                  key={ev.id}
                  onClick={() => handleEventToggle(ev.id)}
                  className={`group cursor-pointer p-5 rounded-2xl border-2 transition-all duration-200 ${
                    isSelected 
                    ? "border-blue-500 bg-blue-50 shadow-md scale-[1.02]" 
                    : "border-slate-100 bg-slate-50/50 hover:border-blue-200 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-2">
                      <h3 className={`font-bold transition-colors ${isSelected ? "text-blue-700" : "text-slate-800"}`}>
                        {ev.title}
                      </h3>
                      
                      <div className="flex flex-wrap gap-2">
                        {/* DATE RANGE BADGE */}
                        <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider transition-colors ${
                          isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                        }`}>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>
                            {ev.start_date ? formatDate(ev.start_date) : 'TBA'}
                            {ev.end_date && ev.end_date !== ev.start_date && (
                              <> — {formatDate(ev.end_date)}</>
                            )}
                          </span>
                        </div>

                        {/* TYPE BADGE (Fixed Visibility) */}
                        <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider transition-all border ${
                          isSelected 
                            ? "bg-blue-100 text-blue-700 border-blue-200" 
                            : ev.type?.toLowerCase() === 'online' 
                              ? "bg-green-100 text-green-700 border-green-200" 
                              : "bg-orange-100 text-orange-700 border-orange-200"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? "bg-blue-600" : ev.type?.toLowerCase() === 'online' ? "bg-green-500" : "bg-orange-500"
                          }`}></span>
                          {ev.type || 'Offline'}
                        </div>
                      </div>
                    </div>

                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                      isSelected ? "bg-blue-600 border-blue-600" : "bg-white border-slate-300 group-hover:border-blue-400"
                    }`}>
                      {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-500 line-clamp-2 italic leading-relaxed">
                    {ev.description}
                  </p>
                </div>
              );
            }) : (
              <div className="col-span-full py-10 text-center">
                <p className="text-blue-500 animate-pulse font-medium">Fetching upcoming schedule...</p>
              </div>
            )}
          </div>
        </div>

        {/* --- REGISTRATION FORM --- */}
        <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-lg p-8 md:p-10 rounded-3xl shadow-2xl border border-white/50">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">1</div>
            <h2 className="text-xl font-bold text-slate-800">Your Information</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-x-6 gap-y-6">
            <Input label="Full Name (As per Marksheet)" required placeholder="Alphabets only" value={form.name} onChange={handleNameChange} />
            <Input label="Email Address" type="email" required placeholder="name@example.com" value={form.email} onChange={(v: string) => setForm({ ...form, email: v })} />
            <Input label="Mobile Number (Preferrably WhatsApp)" type="tel" placeholder="10-digit number" required value={form.phone} onChange={(v: string) => setForm({ ...form, phone: v.replace(/\D/g, "").slice(0, 10) })} />
            <Input label="Institution" placeholder="Full College Name" value={form.institution} onChange={(v: string) => setForm({ ...form, institution: v })} />
          </div>

          <button
            disabled={loading || events.length === 0}
            type="submit"
            className={`mt-10 w-full py-4 rounded-2xl font-bold text-white text-lg transition-all transform active:scale-95 ${
              loading || form.event_ids.length === 0 
              ? 'bg-slate-300 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200'
            }`}
          >
            {loading ? "Processing..." : `Register for ${form.event_ids.length} Event(s)`}
          </button>
        </form>
      </div>
    </div>
  );
}

function Input({ label, type = "text", placeholder, value, onChange, required }: any) {
  return (
    <div className="flex flex-col">
      <label className="block text-xs font-bold mb-2 text-slate-500 uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type} value={value} required={required} placeholder={placeholder}
        className="w-full border border-slate-100 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50/50 text-slate-900 transition-all shadow-sm"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}