import express from 'express';
import { vectorStore } from '../services/vectorStore.js';

const router = express.Router();

/**
 * GET /api/health
 */
router.get('/health', (req, res) => {
  const storeMeta = vectorStore.getMetadata();
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
  const qwenConfigured = Boolean(process.env.QWEN_HF_TOKEN || process.env.EMBEDDING_API_URL);

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Presidency University CampusBuddy AI Helpdesk',
    backend: 'Node.js Express',
    aiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
    aiConfigured: geminiConfigured,
    embeddingService: {
      model: storeMeta.embeddingModel || 'local-hash-v1',
      dimensions: storeMeta.embeddingDimensions || 384,
      externalProviderConfigured: qwenConfigured
    },
    vectorStore: {
      loaded: vectorStore.isReady(),
      totalDocuments: storeMeta.totalDocuments || 0,
      mode: 'vector+lexical'
    }
  });
});

/**
 * GET /api/categories
 */
router.get('/categories', (req, res) => {
  res.json({
    success: true,
    categories: [
      {
        id: 'academics',
        title: 'Academics',
        description: 'Faculty advisory, course assistance, curriculum and academic inquiries',
        icon: 'GraduationCap'
      },
      {
        id: 'examinations',
        title: 'Examinations',
        description: 'Timetables, official notifications, and examination guidelines',
        icon: 'FileText'
      },
      {
        id: 'placements',
        title: 'Placements',
        description: 'Placement training, career guidance, and recruitment drives',
        icon: 'Briefcase'
      },
      {
        id: 'hostel',
        title: 'Hostel',
        description: 'Hostel administration, complaints, rooms, and accommodation issues',
        icon: 'Home'
      },
      {
        id: 'library',
        title: 'Library',
        description: 'Library resources, reading rooms, borrowing rules, and access',
        icon: 'BookOpen'
      },
      {
        id: 'administration',
        title: 'Administration',
        description: 'Certificates, transcripts, student records, and office services',
        icon: 'Building2'
      },
      {
        id: 'attendance',
        title: 'Attendance',
        description: 'Minimum attendance rules, criteria, and university regulations',
        icon: 'CalendarCheck'
      },
      {
        id: 'events',
        title: 'Events',
        description: 'University fests, seminars, workshops, and official announcements',
        icon: 'Sparkles'
      }
    ]
  });
});

/**
 * GET /api/suggestions
 */
router.get('/suggestions', (req, res) => {
  res.json({
    success: true,
    suggestions: [
      {
        category: 'academics',
        query: 'Whom should I contact for academic problems?'
      },
      {
        category: 'examinations',
        query: 'Where can I find the examination timetable?'
      },
      {
        category: 'placements',
        query: 'Whom should I contact for placement training?'
      },
      {
        category: 'hostel',
        query: 'How can I raise a hostel complaint?'
      },
      {
        category: 'attendance',
        query: 'What is the minimum attendance requirement?'
      },
      {
        category: 'library',
        query: 'How can I access library resources?'
      },
      {
        category: 'administration',
        query: 'Where can I get my student certificate and records?'
      },
      {
        category: 'events',
        query: 'Where are university event announcements posted?'
      }
    ]
  });
});

export default router;
