import { ChatApiResponse, CampusCategory } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export async function sendChatMessage(
  message: string,
  conversationHistory: { role: string; content: string }[] = [],
  category?: string,
  token?: string | null
): Promise<ChatApiResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message,
      conversationHistory,
      category
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.reply || `Server error: HTTP ${response.status}`);
  }

  return response.json();
}

export async function fetchCategories(): Promise<CampusCategory[]> {
  try {
    const res = await fetch(`${API_BASE}/api/categories`);
    if (res.ok) {
      const data = await res.json();
      return data.categories || [];
    }
  } catch (err) {
    console.warn('Failed to fetch dynamic categories:', err);
  }

  // Baseline fallback
  return [
    { id: 'academics', title: 'Academics', description: 'Faculty advisory, course assistance, curriculum', icon: 'GraduationCap' },
    { id: 'examinations', title: 'Examinations', description: 'Timetables, official notifications, and guidelines', icon: 'FileText' },
    { id: 'placements', title: 'Placements', description: 'Placement training, career guidance, recruitment', icon: 'Briefcase' },
    { id: 'hostel', title: 'Hostel', description: 'Hostel administration, complaints, and rooms', icon: 'Home' },
    { id: 'library', title: 'Library', description: 'Library resources, books, and access regulations', icon: 'BookOpen' },
    { id: 'administration', title: 'Administration', description: 'Certificates, transcripts, and student records', icon: 'Building2' }
  ];
}

export async function fetchSuggestions(): Promise<{ category: string; query: string }[]> {
  try {
    const res = await fetch(`${API_BASE}/api/suggestions`);
    if (res.ok) {
      const data = await res.json();
      return data.suggestions || [];
    }
  } catch (err) {
    console.warn('Failed to fetch suggestions:', err);
  }

  return [
    { category: 'academics', query: 'Whom should I contact for academic problems?' },
    { category: 'examinations', query: 'Where can I find the examination timetable?' },
    { category: 'placements', query: 'Whom should I contact for placement training?' },
    { category: 'hostel', query: 'How can I raise a hostel complaint?' },
    { category: 'attendance', query: 'What is the minimum attendance requirement?' }
  ];
}
