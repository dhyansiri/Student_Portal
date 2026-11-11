import React from 'react';
import { 
  GraduationCap, 
  FileText, 
  Briefcase, 
  Home, 
  BookOpen, 
  Building2, 
  CalendarCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { CampusCategory } from '../types';

interface CategoryCardsProps {
  onSelectCategory: (categoryId: string, starterQuery?: string) => void;
}

export const CategoryCards: React.FC<CategoryCardsProps> = ({ onSelectCategory }) => {
  const categories = [
    {
      id: 'academics',
      title: 'Academics',
      description: 'Faculty advisor contacts, course assistance, curriculum inquiries, and study guidance.',
      starter: 'Whom should I contact for academic problems?',
      icon: GraduationCap,
      color: 'from-blue-600 to-indigo-700',
      tag: 'Faculty Advisor'
    },
    {
      id: 'examinations',
      title: 'Examinations',
      description: 'Exam timetables, date sheets, official notifications, and examination guidelines.',
      starter: 'Where can I find the examination timetable?',
      icon: FileText,
      color: 'from-amber-500 to-orange-600',
      tag: 'Timetables'
    },
    {
      id: 'placements',
      title: 'Placements',
      description: 'Placement training, career opportunities, internships, and department contacts.',
      starter: 'Whom should I contact for placement training?',
      icon: Briefcase,
      color: 'from-emerald-600 to-teal-700',
      tag: 'Career & Training'
    },
    {
      id: 'hostel',
      title: 'Hostel',
      description: 'Hostel administration, room allotment queries, complaints, and facilities.',
      starter: 'How can I raise a hostel complaint?',
      icon: Home,
      color: 'from-rose-600 to-pink-700',
      tag: 'Administration'
    },
    {
      id: 'library',
      title: 'Library',
      description: 'Library resource access, reading room timings, book search, and borrowing rules.',
      starter: 'How can I access library resources?',
      icon: BookOpen,
      color: 'from-purple-600 to-indigo-800',
      tag: 'Books & Resources'
    },
    {
      id: 'administration',
      title: 'Administration',
      description: 'Student records, bonafide certificates, transcripts, and administrative offices.',
      starter: 'Where can I get my student certificate and records?',
      icon: Building2,
      color: 'from-slate-700 to-slate-900',
      tag: 'Certificates & Records'
    }
  ];

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Presidency Campus Knowledge
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Explore University Help Categories
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Select a category to ask specific questions or explore grounded guidance.
          </p>
        </div>

        {/* Quick pill filters for Attendance and Events */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onSelectCategory('attendance', 'What is the minimum attendance requirement?')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition shadow-xs"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
            Attendance Rules
          </button>
          <button
            onClick={() => onSelectCategory('events', 'Where are university event announcements posted?')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            University Events
          </button>
        </div>
      </div>

      {/* 6 Category Grid Cards (Reference UI Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id, cat.starter)}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                    {cat.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-700 group-hover:text-blue-900">
                <span>Ask about {cat.title}</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
