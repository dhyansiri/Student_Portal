import React from 'react';
import { 
  Bot, 
  User, 
  GraduationCap, 
  FileText, 
  Briefcase, 
  Home, 
  BookOpen, 
  Building2, 
  CalendarCheck, 
  Sparkles,
  ArrowRight,
  LogOut,
  Mail,
  ShieldCheck,
  IdCard
} from 'lucide-react';
import { StudentProfile } from '../types';

interface DashboardProps {
  user: StudentProfile;
  onNavigateToChat: (categoryId?: string, query?: string) => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  onNavigateToChat,
  onLogout
}) => {
  const categories = [
    { id: 'academics', title: 'Academics', icon: GraduationCap, desc: 'Faculty advisory and course assistance', starter: 'Whom should I contact for academic problems?' },
    { id: 'attendance', title: 'Attendance', icon: CalendarCheck, desc: 'Minimum attendance rules & criteria', starter: 'What is the minimum attendance requirement?' },
    { id: 'examinations', title: 'Examinations', icon: FileText, desc: 'Timetables and official exam notifications', starter: 'Where can I find the examination timetable?' },
    { id: 'placements', title: 'Placements', icon: Briefcase, desc: 'Career training and department information', starter: 'Whom should I contact for placement training?' },
    { id: 'library', title: 'Library', icon: BookOpen, desc: 'Resources, books, and access regulations', starter: 'How can I access library resources?' },
    { id: 'hostel', title: 'Hostel', icon: Home, desc: 'Complaints and hostel administration', starter: 'How can I raise a hostel complaint?' },
    { id: 'administration', title: 'Administration', icon: Building2, desc: 'Certificates, transcripts, and records', starter: 'Where can I get my student certificate and records?' },
    { id: 'events', title: 'Events', icon: Sparkles, desc: 'University fests, seminars, and announcements', starter: 'Where are university event announcements posted?' }
  ];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Student Profile Card Header */}
      <div className="bg-gradient-to-r from-[#0B1E3D] via-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 border border-blue-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-400 text-blue-950 font-extrabold flex items-center justify-center text-2xl sm:text-3xl shadow-lg border-2 border-amber-300">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 bg-blue-800/80 px-2.5 py-0.5 rounded-full text-[11px] text-amber-300 font-semibold mb-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Presidency University Student
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{user.full_name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-1 text-xs text-blue-200">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {user.email}</span>
              {user.usn && <span className="flex items-center gap-1"><IdCard className="w-3.5 h-3.5" /> USN: {user.usn}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => onNavigateToChat()}
            className="flex-1 md:flex-initial bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold px-5 py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>Open AI Helpdesk</span>
          </button>
          <button
            onClick={onLogout}
            title="Log Out"
            className="p-3 bg-blue-950/60 hover:bg-rose-900/60 text-blue-200 hover:text-white rounded-xl transition border border-blue-800/60 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 8 Knowledge Categories Quick Access */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">University Knowledge Base Categories</h2>
          <span className="text-xs text-slate-500">8 Supported Topic Areas</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => onNavigateToChat(cat.id, cat.starter)}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center mb-3 group-hover:bg-[#0B1E3D] group-hover:text-amber-400 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-900">{cat.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{cat.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-700">
                  <span>Ask Question</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
