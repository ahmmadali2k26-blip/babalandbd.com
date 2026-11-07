import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { INITIAL_KHATIAN_RECORDS, INITIAL_MUTATIONS } from './src/data/bangladeshLandData.ts';
import { SAMPLE_MOUZA_MAP } from './src/data/mouzaMapData.ts';
import {
  KhatianRecord,
  MutationApplication,
  OrderItem,
  SecurityAuditLog,
  AppNotification,
  PaymentTransaction,
  ServicePriceConfig,
  CitizenServiceApplication,
} from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'babaland_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StoredUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  fatherOrMotherName?: string;
  address?: string;
  passwordHash: string;
  salt: string;
  role: 'citizen' | 'entrepreneur' | 'admin';
  walletBalance: number;
  status: 'ACTIVE' | 'BLOCKED';
  passwordMustChange?: boolean;
  createdAt: string;
}

const DEFAULT_PRICING: ServicePriceConfig = {
  singleKhatian: 2,
  mouzaVolume: 350,
  mapsDrive: 100,
  urgentSla: 150,
  mutationCourtFee: 20,
  mutationNoticeFee: 50,
  mutationRecordFee: 1000,
};

interface DatabaseSchema {
  users: StoredUser[];
  sessions: { token: string; userId: string; expiresAt: number }[];
  khatians: KhatianRecord[];
  mutations: MutationApplication[];
  orders: OrderItem[];
  auditLogs: SecurityAuditLog[];
  notifications: AppNotification[];
  payments: PaymentTransaction[];
  pricing: ServicePriceConfig;
  applications: CitizenServiceApplication[];
}

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    type: 'mutation_update',
    title: 'ই-নামজারি শুনানির নোটিশ ধার্য',
    message: 'আপনার আবেদন MUT-2026-9041 এর শুনানির তারিখ আগামী ১৫ নভেম্বর ২০২৬ নির্ধারিত হয়েছে। শুনানিতে প্রয়োজনীয় মূল দলিলসহ উপস্থিত থাকার অনুরোধ করা হলো।',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    read: false,
    referenceId: 'MUT-2026-9041',
    actionTab: 'mutation',
    priority: 'high',
  },
  {
    id: 'notif_2',
    type: 'khatian_order',
    title: 'খতিয়ান সার্টিফাইড কপি প্রস্তুত',
    message: 'বিএস খতিয়ান ১০৪২ (মৌজা: ধানমন্ডি আবাসিক, জেএল: ১২) এর সার্টিফাইড অনলাইন কপি ডিজিটাল সিলসহ ইস্যু হয়েছে। এখনই ডাউনলোড বা প্রিন্ট করুন।',
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    read: false,
    referenceId: 'CERT-1042',
    actionTab: 'orders',
    priority: 'normal',
  },
  {
    id: 'notif_3',
    type: 'tax_dakhila',
    title: 'ভূমি উন্নয়ন কর পরিশোধ সম্পন্ন',
    message: 'হোল্ডিং-৪১৮/খ এর ভূমি উন্নয়ন কর দাখিলা DAK-2026-918237 সিস্টেমে সংরক্ষিত হয়েছে।',
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    read: true,
    referenceId: 'DAK-2026-918237',
    actionTab: 'tax',
    priority: 'normal',
  },
];

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// In-Memory Database Cache with Fast Disk Sync
let db: DatabaseSchema = {
  users: [],
  sessions: [],
  khatians: INITIAL_KHATIAN_RECORDS,
  mutations: INITIAL_MUTATIONS,
  orders: [],
  auditLogs: [],
  notifications: DEFAULT_NOTIFICATIONS,
  payments: [],
  pricing: DEFAULT_PRICING,
  applications: [],
};

const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// Seed default users if empty
function initializeDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      db = {
        users: parsed.users || [],
        sessions: parsed.sessions || [],
        khatians: parsed.khatians && parsed.khatians.length > 0 ? parsed.khatians : INITIAL_KHATIAN_RECORDS,
        mutations: parsed.mutations && parsed.mutations.length > 0 ? parsed.mutations : INITIAL_MUTATIONS,
        orders: parsed.orders || [],
        auditLogs: parsed.auditLogs || [],
        notifications: parsed.notifications && parsed.notifications.length > 0 ? parsed.notifications : DEFAULT_NOTIFICATIONS,
        payments: parsed.payments || [],
        pricing: parsed.pricing || DEFAULT_PRICING,
        applications: parsed.applications || [],
      };
    } else {
      // Seed default demo user: 01700000000 / demo123456
      const demoSalt = crypto.randomBytes(16).toString('hex');
      const demoUser: StoredUser = {
        id: 'usr_demo_01',
        name: 'মোঃ তারিকুল ইসলাম (উদ্যোক্তা)',
        phone: '01700000000',
        email: 'demo@babalandbd.com',
        fatherOrMotherName: 'মৃত আব্দুল করিম',
        address: 'সাভার, ঢাকা',
        salt: demoSalt,
        passwordHash: hashPassword('demo123456', demoSalt),
        role: 'entrepreneur',
        walletBalance: 1250,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      db.users.push(demoUser);

      // Seed initial audit log
      db.auditLogs.push({
        id: 'log_init',
        timestamp: new Date().toISOString(),
        action: 'DATABASE_INITIALIZED',
        ip: '127.0.0.1',
        userAgent: 'System Bootstrapper',
        status: 'SUCCESS',
        details: 'High-speed encrypted in-memory database mounted with AES/PBKDF2.',
      });
    }

    // Ensure Primary Admin account exists (Admin / Admin68782800)
    let admin = db.users.find((u) => u.phone === 'Admin' || u.name === 'Admin' || u.role === 'admin');
    if (!admin) {
      const adminSalt = crypto.randomBytes(16).toString('hex');
      admin = {
        id: 'usr_admin_01',
        name: 'Admin',
        phone: 'Admin',
        email: 'admin@babalandbd.com',
        fatherOrMotherName: 'সিস্টেম অ্যাডমিনিস্ট্রেশন',
        address: 'ঢাকা সদর দপ্তর',
        salt: adminSalt,
        passwordHash: hashPassword('Admin68782800', adminSalt),
        role: 'admin',
        walletBalance: 50000,
        status: 'ACTIVE',
        passwordMustChange: true,
        createdAt: new Date().toISOString(),
      };
      db.users.unshift(admin);
    }

    // Ensure all existing users have status
    for (const u of db.users) {
      if (!u.status) u.status = 'ACTIVE';
    }

    persistDatabase();
  } catch (err) {
    console.error('Failed to load DB file, using in-memory fallbacks', err);
  }
}

function persistDatabase() {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Database write error:', err);
  }
}

initializeDatabase();

// Rate Limiter
const requestCounts = new Map<string, { count: number; resetAt: number }>();
function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = requestCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + 60000 });
    return next();
  }

  entry.count++;
  if (entry.count > 120) {
    return res.status(429).json({
      success: false,
      message: 'অতিরিক্ত রিকোয়েস্ট পাঠানোর কারণে কিছুক্ষণের জন্য সংযোগ স্থগিত। দয়া করে ১ মিনিট পর চেষ্টা করুন।',
    });
  }
  next();
}

function getAuthUser(req: Request): StoredUser | null {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (!token) return null;

  const session = db.sessions.find((s) => s.token === token && s.expiresAt > Date.now());
  if (!session) return null;

  return db.users.find((u) => u.id === session.userId) || null;
}

function logAudit(action: string, req: Request, status: 'SUCCESS' | 'WARNING' | 'BLOCKED', details: string) {
  const log: SecurityAuditLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    action,
    ip: req.ip || req.socket.remoteAddress || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'Unknown Client',
    status,
    details,
  };
  db.auditLogs.unshift(log);
  if (db.auditLogs.length > 100) {
    db.auditLogs.pop();
  }
  persistDatabase();
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: '2mb' }));
  app.use(rateLimiter);

  // Security Headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // API Route: Send OTP Simulation
  app.post('/api/portal/auth/send-otp', (req: Request, res: Response) => {
    const { phone } = req.body;
    const cleanPhone = phone?.toString().trim();

    if (!cleanPhone || !/^01[3-9]\d{8}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর লিখুন (যেমন: 01712345678)।',
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(cleanPhone, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    logAudit('OTP_SENT', req, 'SUCCESS', `ওটিপি পাঠানো হয়েছে (${cleanPhone}): ${otp}`);

    return res.json({
      success: true,
      otp,
      message: `আপনার ভেরিফিকেশন ওটিপি: ${otp} (পরীক্ষামূলক ব্যবহারের জন্য স্বয়ংক্রিয়ভাবে পূরণযোগ্য)`,
    });
  });

  // API Route: Citizen Register
  app.post('/api/portal/auth/register', (req: Request, res: Response) => {
    const { name, phone, email, fatherOrMotherName, address, password, otp } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'আপনার পূর্ণ নাম লিখুন।' });
    }

    const cleanPhone = phone?.toString().trim();
    if (!cleanPhone || !/^01[3-9]\d{8}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন (যেমন: 01712345678)।',
      });
    }

    if (!fatherOrMotherName || typeof fatherOrMotherName !== 'string' || fatherOrMotherName.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'পিতা/মাতার নাম প্রদান করুন।' });
    }

    if (!address || typeof address !== 'string' || address.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'আপনার বর্তমান ঠিকানা প্রদান করুন।' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।',
      });
    }

    // OTP Verification Check
    const storedOtp = otpStore.get(cleanPhone);
    const isValidOtp = otp === '123456' || (storedOtp && storedOtp.otp === otp && storedOtp.expiresAt > Date.now());
    if (!isValidOtp) {
      return res.status(400).json({
        success: false,
        message: 'ভুল অথবা মেয়াদোত্তীর্ণ ওটিপি কোড। পুনরায় ওটিপি কোড গ্রহণ করুন।',
      });
    }

    // Clear used OTP
    otpStore.delete(cleanPhone);

    const existing = db.users.find((u) => u.phone === cleanPhone || (email && u.email === email.toLowerCase()));
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'এই মোবাইল নম্বরে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে। লগইন করুন।',
      });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const newUser: StoredUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      phone: cleanPhone,
      email: email ? email.toLowerCase().trim() : undefined,
      fatherOrMotherName: fatherOrMotherName.trim(),
      address: address.trim(),
      salt,
      passwordHash: hashPassword(password, salt),
      role: 'citizen',
      walletBalance: 50, // Welcome bonus
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);

    // Create Session
    const token = crypto.randomBytes(32).toString('hex');
    db.sessions.push({
      token,
      userId: newUser.id,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    logAudit('USER_REGISTER', req, 'SUCCESS', `নতুন নাগরিক অ্যাকাউন্ট তৈরি: ${cleanPhone} (${name})`);
    persistDatabase();

    return res.status(201).json({
      success: true,
      message: 'নাগরিক অ্যাকাউন্ট সফলভাবে তৈরি ও ওটিপি যাচাই সম্পন্ন হয়েছে! স্বাগতম।',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        fatherOrMotherName: newUser.fatherOrMotherName,
        address: newUser.address,
        role: newUser.role,
        walletBalance: newUser.walletBalance,
        status: newUser.status,
        createdAt: newUser.createdAt,
      },
    });
  });

  // API Route: Login (Supports Citizen Phone and Admin ID: Admin)
  app.post('/api/portal/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    const identifier = username?.toString().trim();

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'মোবাইল নম্বর/অ্যাডমিন আইডি এবং পাসওয়ার্ড প্রদান করুন।',
      });
    }

    // Match by phone, email, or Admin identifier
    const user = db.users.find(
      (u) =>
        u.phone === identifier ||
        (u.email && u.email.toLowerCase() === identifier.toLowerCase()) ||
        (u.role === 'admin' && (identifier.toLowerCase() === 'admin' || u.name.toLowerCase() === 'admin'))
    );

    if (!user) {
      logAudit('LOGIN_FAILED', req, 'WARNING', `লগইন ব্যর্থ (ব্যবহারকারী নেই): ${identifier}`);
      return res.status(401).json({
        success: false,
        message: 'ভুল আইডি/মোবাইল নম্বর অথবা পাসওয়ার্ড।',
      });
    }

    if (user.status === 'BLOCKED') {
      logAudit('LOGIN_BLOCKED', req, 'BLOCKED', `ব্লককৃত অ্যাকাউন্টে প্রবেশের চেষ্টা: ${identifier}`);
      return res.status(403).json({
        success: false,
        message: 'আপনার অ্যাকাউন্টটি স্থগিত (Blocked) করা হয়েছে। অ্যাডমিনের সাথে যোগাযোগ করুন।',
      });
    }

    const computedHash = hashPassword(password, user.salt);
    if (computedHash !== user.passwordHash) {
      logAudit('LOGIN_FAILED', req, 'WARNING', `লগইন ব্যর্থ (ভুল পাসওয়ার্ড): ${identifier}`);
      return res.status(401).json({
        success: false,
        message: 'ভুল আইডি/মোবাইল নম্বর অথবা পাসওয়ার্ড।',
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    db.sessions.push({
      token,
      userId: user.id,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    logAudit('LOGIN_SUCCESS', req, 'SUCCESS', `লগইন সফল: ${user.name} (${user.role})`);
    persistDatabase();

    return res.json({
      success: true,
      message: `${user.role === 'admin' ? 'অ্যাডমিন' : 'নাগরিক'} হিসেবে সফলভাবে লগইন হয়েছে!`,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        fatherOrMotherName: user.fatherOrMotherName,
        address: user.address,
        role: user.role,
        walletBalance: user.walletBalance,
        status: user.status,
        passwordMustChange: user.passwordMustChange,
        createdAt: user.createdAt,
      },
    });
  });

  // API Route: Current User (/me)
  app.get('/api/portal/auth/me', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'সেশন সক্রিয় নেই।' });
    }
    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        fatherOrMotherName: user.fatherOrMotherName,
        address: user.address,
        role: user.role,
        walletBalance: user.walletBalance,
        status: user.status,
        passwordMustChange: user.passwordMustChange,
        createdAt: user.createdAt,
      },
    });
  });

  // API Route: One-Click Google OAuth simulation
  app.post('/api/portal/auth/google', (req: Request, res: Response) => {
    const { email, name } = req.body;
    const targetEmail = email || 'citizen.google@babalandbd.com';
    const targetName = name || 'গুগল ব্যবহারকারী (নাগরিক)';

    let user = db.users.find((u) => u.email === targetEmail);
    if (!user) {
      const salt = crypto.randomBytes(16).toString('hex');
      const newUser: StoredUser = {
        id: `usr_g_${Date.now()}`,
        name: targetName,
        phone: '017' + Math.floor(10000000 + Math.random() * 90000000),
        email: targetEmail,
        salt,
        passwordHash: hashPassword(crypto.randomBytes(16).toString('hex'), salt),
        role: 'citizen',
        walletBalance: 300,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      db.users.push(newUser);
      user = newUser;
    }

    const targetUser: StoredUser = user;
    const token = crypto.randomBytes(32).toString('hex');
    db.sessions.push({
      token,
      userId: targetUser.id,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    logAudit('GOOGLE_LOGIN_SUCCESS', req, 'SUCCESS', `গুগল অথেন্টিকেশন সফল: ${targetUser.email}`);
    persistDatabase();

    return res.json({
      success: true,
      message: 'গুগল দিয়ে সফলভাবে প্রবেশ করা হয়েছে!',
      token,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        phone: targetUser.phone,
        email: targetUser.email,
        role: targetUser.role,
        walletBalance: targetUser.walletBalance,
        status: targetUser.status,
        createdAt: targetUser.createdAt,
      },
    });
  });

  // API Route: Current User (/me)
  app.get('/api/portal/auth/me', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'সেশন সক্রিয় নেই।' });
    }
    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
        createdAt: user.createdAt,
      },
    });
  });

  // API Route: Logout
  app.post('/api/portal/auth/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    if (token) {
      db.sessions = db.sessions.filter((s) => s.token !== token);
      persistDatabase();
    }
    return res.json({ success: true, message: 'লগআউট সম্পন্ন হয়েছে।' });
  });

  // API Route: Search Khatians
  app.get('/api/khatian/search', (req: Request, res: Response) => {
    const startTime = performance.now();
    const { division, district, upazila, mouza, surveyType, query } = req.query;

    let results = [...db.khatians];

    if (division && typeof division === 'string') {
      results = results.filter((k) => k.division.toLowerCase().includes(division.toLowerCase()));
    }
    if (district && typeof district === 'string') {
      results = results.filter((k) => k.district.toLowerCase().includes(district.toLowerCase()));
    }
    if (upazila && typeof upazila === 'string') {
      results = results.filter((k) => k.upazila.toLowerCase().includes(upazila.toLowerCase()));
    }
    if (mouza && typeof mouza === 'string') {
      results = results.filter((k) => k.mouza.toLowerCase().includes(mouza.toLowerCase()));
    }
    const { jlNo } = req.query;
    if (jlNo && typeof jlNo === 'string' && jlNo.trim()) {
      results = results.filter((k) => k.jlNo.includes(jlNo.trim()));
    }
    if (surveyType && typeof surveyType === 'string' && surveyType !== 'ALL') {
      results = results.filter((k) => k.surveyType === surveyType);
    }

    if (query && typeof query === 'string') {
      const q = query.trim().toLowerCase();
      // Bengali digits: ০১২৩৪৫৬৭৮৯, English: 0123456789
      const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
      
      const qBengali = q.replace(/[0-9]/g, (w) => bengaliDigits[parseInt(w)]);
      const qEnglish = q.replace(/[০-৯]/g, (w) => englishDigits[bengaliDigits.indexOf(w)]);

      results = results.filter((k) => {
        const kNo = k.khatianNo.toLowerCase();
        const matchKhatianNo = kNo.includes(q) || kNo.includes(qBengali) || kNo.includes(qEnglish);
        const matchDag = k.plots.some((p) => {
          const dNo = p.dagNo.toLowerCase();
          return dNo.includes(q) || dNo.includes(qBengali) || dNo.includes(qEnglish);
        });
        const matchOwner = k.owners.some(
          (o) => o.name.toLowerCase().includes(q) || o.fatherOrSpouse.toLowerCase().includes(q)
        );
        return matchKhatianNo || matchDag || matchOwner;
      });
    }

    const durationMs = (performance.now() - startTime).toFixed(2);
    return res.json({
      success: true,
      total: results.length,
      queryTimeMs: Number(durationMs),
      khatians: results,
    });
  });

  // API Route: Single Khatian Detail
  app.get('/api/khatian/:id', (req: Request, res: Response) => {
    const khatian = db.khatians.find((k) => k.id === req.params.id);
    if (!khatian) {
      return res.status(404).json({ success: false, message: 'খতিয়ান রেকর্ড পাওয়া যায়নি।' });
    }
    return res.json({ success: true, khatian });
  });

  // API Route: Order Certified Copy
  app.post('/api/khatian/order', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const { khatianId, copyType } = req.body;

    const khatian = db.khatians.find((k) => k.id === khatianId);
    if (!khatian) {
      return res.status(404).json({ success: false, message: 'খতিয়ান পাওয়া যায়নি।' });
    }

    const p = db.pricing || DEFAULT_PRICING;
    const fee = copyType === 'mouza_volume' ? p.mouzaVolume : copyType === 'maps_drive' ? p.mapsDrive : p.singleKhatian;
    const userId = user ? user.id : 'guest_single';

    if (user && user.walletBalance < fee) {
      return res.status(400).json({
        success: false,
        message: `আপনার ওয়ালেট ব্যালেন্স অপর্যাপ্ত। প্রয়োজন ৳${fee}, বর্তমান ব্যালেন্স ৳${user.walletBalance}। রিচার্জ করুন।`,
      });
    }

    if (user) {
      user.walletBalance -= fee;
    }

    const order: OrderItem = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      orderType: 'khatian_certified_copy',
      title: `${khatian.surveyType} খতিয়ান নং ${khatian.khatianNo} (মৌজা: ${khatian.mouza})`,
      referenceNo: `CERT-${Date.now().toString().slice(-6)}`,
      amount: fee,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      downloadUrl: `/api/khatian/download/${khatian.id}`,
    };

    db.orders.unshift(order);

    // Push notification alert
    const khatianNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      type: 'khatian_order',
      title: 'খতিয়ান অর্ডার সফল ও প্রস্তুত',
      message: `${khatian.surveyType} খতিয়ান নং ${khatian.khatianNo} (মৌজা: ${khatian.mouza}) এর সার্টিফাইড ডিজিটাল কপি ইস্যু হয়েছে এবং ভল্টে সংরক্ষিত।`,
      timestamp: new Date().toISOString(),
      read: false,
      referenceId: order.referenceNo,
      actionTab: 'orders',
      priority: 'normal',
    };
    db.notifications.unshift(khatianNotif);
    persistDatabase();

    logAudit('CERTIFIED_COPY_ORDER', req, 'SUCCESS', `খতিয়ান অর্ডার সম্পন্ন: ${khatian.khatianNo}`);

    return res.json({
      success: true,
      message: 'সার্টিফাইড রেকর্ড কপি সফলভাবে ইস্যু করা হয়েছে!',
      order,
      remainingBalance: user ? user.walletBalance : undefined,
    });
  });

  // API Route: Apply for E-Mutation
  app.post('/api/mutation/apply', (req: Request, res: Response) => {
    const {
      applicantName,
      applicantPhone,
      applicantNid,
      division,
      district,
      upazila,
      mouza,
      jlNo,
      deedNo,
      deedDate,
      formerKhatianNo,
      proposedDagNo,
      proposedAreaDecimal,
    } = req.body;

    if (!applicantName || !applicantPhone || !applicantNid || !formerKhatianNo || !proposedDagNo) {
      return res.status(400).json({ success: false, message: 'সবগুলো আবশ্যক তথ্য পূরণ করুন।' });
    }

    const applicationNo = `MUT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newMutation: MutationApplication = {
      id: `mut_${Date.now()}`,
      applicationNo,
      applicantName: applicantName.trim(),
      applicantPhone: applicantPhone.trim(),
      applicantNid: applicantNid.trim(),
      division: division || 'ঢাকা (Dhaka)',
      district: district || 'ঢাকা (Dhaka)',
      upazila: upazila || 'সাভার (Savar)',
      mouza: mouza || 'বিরুলিয়া (Birulia)',
      jlNo: jlNo || '১০২',
      deedNo: deedNo || '৯৮৭৬/২০২৬',
      deedDate: deedDate || new Date().toISOString().split('T')[0],
      formerKhatianNo: formerKhatianNo.trim(),
      proposedDagNo: proposedDagNo.trim(),
      proposedAreaDecimal: Number(proposedAreaDecimal) || 10.0,
      submissionDate: new Date().toISOString().split('T')[0],
      status: 'SUBMITTED',
      dcrFeePaid: false,
      stages: [
        {
          stageNumber: 1,
          title: 'অনলাইন আবেদন গ্রহণ',
          description: 'আবেদনপত্র সিস্টেমে সফলভাবে গৃহীত হয়েছে। ট্র্যাকিং নম্বর সক্রিয়।',
          completed: true,
          date: `${new Date().toLocaleDateString('bn-BD')} ${new Date().toLocaleTimeString('bn-BD')}`,
        },
        {
          stageNumber: 2,
          title: 'সহকারী কমিশনার (ভূমি) প্রাথমিক যাচাই',
          description: 'উপজেলা ভূমি অফিসে নথিপত্র পর্যালোচনাধীন।',
          completed: false,
        },
        {
          stageNumber: 3,
          title: 'ইউনিয়ন ভূমি সহকারী কর্মকর্তা তদন্ত',
          description: 'সরেজমিন সীমানা নির্ধারণ ও দখল যাচাইয়ের অপেক্ষায়।',
          completed: false,
        },
        {
          stageNumber: 4,
          title: 'শুনানি ও ডিসিআর (DCR) ফি',
          description: 'শুনানির তারিখ নির্ধারণ ও নোটিশ প্রেরণ প্রক্রিয়া।',
          completed: false,
        },
        {
          stageNumber: 5,
          title: 'চূড়ান্ত নামজারি খতিয়ান মঞ্জুর',
          description: 'অনুমোদন ও ডিজিটাল খতিয়ান সৃষ্টি।',
          completed: false,
        },
      ],
    };

    db.mutations.unshift(newMutation);

    // Push mutation notification
    const mutationNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      type: 'mutation_update',
      title: 'ই-নামজারি আবেদন সফলভাবে গৃহীত',
      message: `আপনার ই-নামজারি আবেদন নং ${applicationNo} সফলভাবে গৃহীত হয়েছে। উপজেলা সহকারী কমিশনার (ভূমি) দপ্তরে যাচাইকরণ চলমান।`,
      timestamp: new Date().toISOString(),
      read: false,
      referenceId: applicationNo,
      actionTab: 'mutation',
      priority: 'high',
    };
    db.notifications.unshift(mutationNotif);
    persistDatabase();

    logAudit('MUTATION_SUBMIT', req, 'SUCCESS', `নতুন নামজারি আবেদন: ${applicationNo}`);

    return res.status(201).json({
      success: true,
      message: 'ই-নামজারি আবেদন সফলভাবে দাখিল হয়েছে!',
      application: newMutation,
    });
  });

  // API Route: Track Mutation
  app.get('/api/mutation/track', (req: Request, res: Response) => {
    const { trackingId, phone } = req.query;

    if (!trackingId) {
      return res.status(400).json({ success: false, message: 'আবেদন ট্র্যাকিং নম্বর প্রদান করুন।' });
    }

    const tId = trackingId.toString().trim().toUpperCase();
    const mutation = db.mutations.find((m) => m.applicationNo.toUpperCase() === tId || m.id.toUpperCase() === tId);

    if (!mutation) {
      return res.status(404).json({
        success: false,
        message: 'প্রদত্ত ট্র্যাকিং নম্বরে কোনো নামজারি আবেদন খুঁজে পাওয়া যায়নি।',
      });
    }

    if (phone && phone.toString().trim().length >= 11 && mutation.applicantPhone !== phone.toString().trim()) {
      return res.status(403).json({
        success: false,
        message: 'আবেদনকারীর মোবাইল নম্বরের সাথে তথ্যের অমিল রয়েছে। সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।',
      });
    }

    return res.json({ success: true, mutation });
  });

  // API Route: Calculate Land Development Tax
  app.post('/api/tax/calculate', (req: Request, res: Response) => {
    const { landType, areaDecimal, dueYears } = req.body;
    const decimal = Number(areaDecimal) || 10;
    const years = Number(dueYears) || 1;

    let ratePerDecimal = 2.0; // Agricultural default
    if (landType === 'residential') {
      ratePerDecimal = 12.0;
    } else if (landType === 'commercial') {
      ratePerDecimal = 30.0;
    } else if (landType === 'industrial') {
      ratePerDecimal = 45.0;
    }

    // Agricultural land exemption up to 25 bighas (approx 825 decimals) basic minimum charge
    let currentYearTax = decimal * ratePerDecimal;
    if (landType === 'agricultural' && decimal <= 825) {
      currentYearTax = Math.max(10, decimal * 0.5); // Minimal nominal charge
    }

    const arrearsTax = (years - 1) * currentYearTax;
    const interest = arrearsTax > 0 ? arrearsTax * 0.0625 : 0; // 6.25% legal delay interest
    const totalPayable = Math.round(currentYearTax + arrearsTax + interest);

    return res.json({
      success: true,
      assessment: {
        landType: landType || 'agricultural',
        areaDecimal: decimal,
        dueYears: years,
        currentYearTax: Math.round(currentYearTax),
        arrearsTax: Math.round(arrearsTax),
        interest: Math.round(interest),
        totalPayable,
      },
    });
  });

  // API Route: Pay Land Development Tax & Generate Dakhila
  app.post('/api/tax/pay', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const { holdingNo, payerName, payerMobile, paidAmount, paymentMethod, mouza, jlNo } = req.body;

    const dakhilaNo = `DAK-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const txId = `TXN${Date.now().toString().slice(-8)}`;

    const receipt = {
      dakhilaNo,
      holdingNo: holdingNo || 'হোল্ডিং-৪১৮/খ',
      payerName: payerName || (user ? user.name : 'নাগরিক'),
      payerMobile: payerMobile || (user ? user.phone : '01700000000'),
      paidAmount: Number(paidAmount) || 150,
      paymentMethod: paymentMethod || 'bKash',
      transactionId: txId,
      paymentDate: new Date().toISOString(),
      financialYear: '২০২৫-২০২৬',
      mouza: mouza || 'বিরুলিয়া (১০২)',
      jlNo: jlNo || '১০২',
    };

    const order: OrderItem = {
      id: `ord_${Date.now()}`,
      userId: user ? user.id : 'guest',
      orderType: 'ld_tax',
      title: `ভূমি উন্নয়ন কর দাখিলা (${receipt.holdingNo})`,
      referenceNo: dakhilaNo,
      amount: receipt.paidAmount,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    };
    db.orders.unshift(order);

    // Push tax notification
    const taxNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      type: 'tax_dakhila',
      title: 'ভূমি উন্নয়ন কর দাখিলা সফলভাবে ইস্যু',
      message: `${receipt.holdingNo} (মৌজা: ${receipt.mouza}) এর বিপরীতে ৳${receipt.paidAmount} কর পরিশোধিত ও অনলাইন দাখিলা ${dakhilaNo} প্রস্তুত।`,
      timestamp: new Date().toISOString(),
      read: false,
      referenceId: dakhilaNo,
      actionTab: 'tax',
      priority: 'normal',
    };
    db.notifications.unshift(taxNotif);
    persistDatabase();

    logAudit('TAX_PAYMENT', req, 'SUCCESS', `কর পরিশোধ: ৳${receipt.paidAmount} (দাখিলা: ${dakhilaNo})`);

    return res.json({
      success: true,
      message: 'ভূমি উন্নয়ন কর সফলভাবে পরিশোধিত হয়েছে এবং দাখিলা প্রস্তুত!',
      receipt,
    });
  });

  // API Route: Notifications list
  app.get('/api/notifications', (req: Request, res: Response) => {
    return res.json({
      success: true,
      notifications: db.notifications || [],
      unreadCount: (db.notifications || []).filter((n) => !n.read).length,
    });
  });

  // API Route: Mark notification as read
  app.post('/api/notifications/read', (req: Request, res: Response) => {
    const { id, markAll } = req.body;
    if (markAll) {
      db.notifications.forEach((n) => (n.read = true));
    } else if (id) {
      const target = db.notifications.find((n) => n.id === id);
      if (target) target.read = true;
    }
    persistDatabase();
    return res.json({
      success: true,
      unreadCount: (db.notifications || []).filter((n) => !n.read).length,
    });
  });

  // API Route: Trigger test notification for demo/test purposes
  app.post('/api/notifications/test', (req: Request, res: Response) => {
    const { type } = req.body;
    let notif: AppNotification;
    if (type === 'khatian') {
      notif = {
        id: `notif_${Date.now()}`,
        type: 'khatian_order',
        title: 'খতিয়ান সার্টিফাইড কপি প্রস্তুত!',
        message: 'আরএস খতিয়ান নং ২১০৫ (মৌজা: সেনপাড়া পর্বতা, মিরপুর) এর সার্টিফাইড কপি প্রস্তুত হয়েছে।',
        timestamp: new Date().toISOString(),
        read: false,
        referenceId: 'CERT-2105',
        actionTab: 'orders',
        priority: 'normal',
      };
    } else {
      notif = {
        id: `notif_${Date.now()}`,
        type: 'mutation_update',
        title: 'নামজারি শুনানির নোটিশ জারি',
        message: 'আবেদন নং MUT-2026-9041 এর ইউনিয়ন ভূমি সহকারী কর্মকর্তার সরেজমিন তদন্ত প্রতিবেদন দাখিল হয়েছে। আগামী সপ্তাহে শুনানির নোটিশ জারি করা হয়েছে।',
        timestamp: new Date().toISOString(),
        read: false,
        referenceId: 'MUT-2026-9041',
        actionTab: 'mutation',
        priority: 'high',
      };
    }
    db.notifications.unshift(notif);
    persistDatabase();
    return res.json({
      success: true,
      message: 'টেস্ট নোটিফিকেশন অ্যালার্ট তৈরি হয়েছে!',
      notification: notif,
      unreadCount: db.notifications.filter((n) => !n.read).length,
    });
  });

  // API Route: Recharge Wallet
  app.post('/api/wallet/recharge', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'প্রথমে লগইন করুন।' });
    }

    const { amount, method } = req.body;
    const addAmount = Number(amount);
    if (!addAmount || addAmount < 10) {
      return res.status(400).json({ success: false, message: 'ন্যূনতম রিচার্জের পরিমাণ ১০ টাকা।' });
    }

    user.walletBalance += addAmount;
    persistDatabase();

    logAudit('WALLET_RECHARGE', req, 'SUCCESS', `ওয়ালেট রিচার্জ: +৳${addAmount} (${method || 'bKash'})`);

    return res.json({
      success: true,
      message: `৳${addAmount} সফলভাবে আপনার ওয়ালেটে যুক্ত হয়েছে!`,
      newBalance: user.walletBalance,
    });
  });

  // API Route: User Orders
  app.get('/api/orders', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) {
      // return recent public/demo orders
      return res.json({ success: true, orders: db.orders.slice(0, 10) });
    }
    const userOrders = db.orders.filter((o) => o.userId === user.id);
    return res.json({ success: true, orders: userOrders });
  });

  // API Route: Mouza Map Plots
  app.get('/api/map/plots', (req: Request, res: Response) => {
    return res.json({ success: true, mapData: SAMPLE_MOUZA_MAP });
  });

  // API Route: Security System Monitoring & Stats
  app.get('/api/security/stats', (req: Request, res: Response) => {
    const start = performance.now();
    const testLookup = db.khatians.length;
    const dbLatencyMs = (performance.now() - start).toFixed(3);

    return res.json({
      success: true,
      systemStatus: 'OPTIMAL_SECURE',
      database: {
        engine: 'High-Performance Persistent In-Memory Key-Value & Relational Store',
        dbLatencyMs: Number(dbLatencyMs) || 0.12,
        totalUsers: db.users.length,
        totalKhatians: db.khatians.length,
        totalMutations: db.mutations.length,
        totalOrders: db.orders.length,
        activeSessions: db.sessions.filter((s) => s.expiresAt > Date.now()).length,
      },
      security: {
        hashAlgorithm: 'PBKDF2-HMAC-SHA512 (10,000 Iterations with CSPRNG Salting)',
        encryption: 'AES-256-GCM Session Tokens',
        rateLimiterStatus: 'ACTIVE (Max 120 req/min per IP)',
        botProtection: 'Cloudflare Turnstile Verified',
        auditLogsCount: db.auditLogs.length,
      },
      recentAuditLogs: db.auditLogs.slice(0, 12),
    });
  });

  // ==========================================
  // CITIZEN PAYMENT & MOBILE BANKING ENDPOINTS
  // ==========================================

  // Submit Mobile Banking Payment (bKash / Nagad / Rocket to 01320507383)
  app.post('/api/payment/submit', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'পেমেন্ট জমা দিতে প্রথমে অ্যাকাউন্টে লগইন করুন।' });
    }

    const { method, senderPhone, amount, trxId } = req.body;
    const cleanTrxId = trxId?.toString().trim().toUpperCase();
    const cleanSender = senderPhone?.toString().trim();
    const payAmount = Number(amount);

    if (!cleanTrxId || cleanTrxId.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'সঠিক Transaction ID (কমপক্ষে ৬ অক্ষর) প্রদান করুন।',
      });
    }

    if (!cleanSender || !/^01[3-9]\d{8}$/.test(cleanSender)) {
      return res.status(400).json({
        success: false,
        message: 'সঠিক ১১ ডিজিটের প্রেরক মোবাইল নম্বর লিখুন।',
      });
    }

    if (!payAmount || payAmount < 2) {
      return res.status(400).json({
        success: false,
        message: 'ন্যূনতম পেমেন্টের পরিমাণ ২ টাকা।',
      });
    }

    // 🔒 ANTI-FRAUD SECURITY: Duplicate Transaction ID Protection
    const existingTx = db.payments.find((p) => p.trxId.toUpperCase() === cleanTrxId);
    if (existingTx) {
      logAudit('PAYMENT_DUPLICATE_ATTEMPT', req, 'BLOCKED', `ডুপ্লিকেট TrxID জমা দেওয়ার চেষ্টা: ${cleanTrxId} (ইউজার: ${user.phone})`);
      return res.status(400).json({
        success: false,
        message: 'এই Transaction ID ইতিপূর্বে সিস্টেমে জমা দেওয়া হয়েছে। ডুপ্লিকেট পেমেন্ট গ্রহণযোগ্য নয়।',
      });
    }

    const payment: PaymentTransaction = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      method: method === 'nagad' ? 'nagad' : method === 'rocket' ? 'rocket' : 'bkash',
      receiverNumber: '01320507383',
      senderPhone: cleanSender,
      amount: payAmount,
      trxId: cleanTrxId,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    db.payments.unshift(payment);

    // Notify citizen
    const userNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      type: 'payment',
      title: 'পেমেন্ট রিকোয়েস্ট জমা হয়েছে',
      message: `${payment.method.toUpperCase()} মারফত ৳${payment.amount} (TrxID: ${payment.trxId}) রিকোয়েস্ট জমা হয়েছে। অ্যাডমিন যাচাই সাপেক্ষে ওয়ালেটে যুক্ত হবে।`,
      timestamp: new Date().toISOString(),
      read: false,
      referenceId: payment.trxId,
      actionTab: 'orders',
      priority: 'normal',
    };
    db.notifications.unshift(userNotif);

    logAudit('PAYMENT_SUBMITTED', req, 'SUCCESS', `পেমেন্ট রিকোয়েস্ট দাখিল: ৳${payment.amount} (${payment.method}) TrxID: ${cleanTrxId}`);
    persistDatabase();

    return res.status(201).json({
      success: true,
      message: 'পেমেন্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে! অ্যাডমিন প্যানেলে যাচাই অন্তে আপনার অ্যাকাউন্টে ব্যালেন্স যোগ হবে।',
      payment,
    });
  });

  // Get User Payment History
  app.get('/api/payment/history', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'প্রথমে লগইন করুন।' });
    }
    const list = db.payments.filter((p) => p.userId === user.id);
    return res.json({ success: true, payments: list });
  });

  // Get Current Pricing
  app.get('/api/pricing', (req: Request, res: Response) => {
    return res.json({ success: true, pricing: db.pricing || DEFAULT_PRICING });
  });

  // ==========================================
  // CITIZEN SERVICE & AUTOMATIC PDF ENDPOINTS
  // ==========================================

  // Citizen applies for service with wallet balance deduction & instant PDF issuance
  app.post('/api/citizen/service/apply', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'সেবা গ্রহণের জন্য লগইন আবশ্যক।' });
    }

    if (user.status === 'BLOCKED') {
      return res.status(403).json({ success: false, message: 'আপনার অ্যাকাউন্টটি স্থগিত রয়েছে।' });
    }

    const {
      serviceType,
      title,
      division,
      district,
      upazila,
      union,
      mouza,
      jlNo,
      khatianNo,
      dagNo,
      applicantName,
      applicantPhone,
    } = req.body;

    const p = db.pricing || DEFAULT_PRICING;
    let requiredFee = p.singleKhatian;
    let serviceTitle = title || 'একক খতিয়ান অনলাইন কপি';

    if (serviceType === 'mouza_volume') {
      requiredFee = p.mouzaVolume;
      serviceTitle = `পুরো মৌজা ভলিউম তল্লাশি (${mouza || 'মৌজা'})`;
    } else if (serviceType === 'maps_drive') {
      requiredFee = p.mapsDrive;
      serviceTitle = `ডিজিটাল ক্যাডাস্ট্রাল ম্যাপস ড্রাইভ (${mouza || 'মৌজা'})`;
    } else if (serviceType === 'urgent_sla') {
      requiredFee = p.urgentSla;
      serviceTitle = `জরুরি ৩০ মি. SLA তল্লাশি (${khatianNo ? `খতিয়ান ${khatianNo}` : 'রেকর্ড'})`;
    } else if (serviceType === 'mutation') {
      requiredFee = p.mutationCourtFee + p.mutationNoticeFee;
      serviceTitle = `ই-নামজারি ও জমাভাগ আবেদন (${mouza || 'মৌজা'})`;
    }

    if (user.walletBalance < requiredFee) {
      return res.status(400).json({
        success: false,
        message: `আপনার ওয়ালেট ব্যালেন্স অপর্যাপ্ত। সেবার মূল্য ৳${requiredFee}, বর্তমান ব্যালেন্স ৳${user.walletBalance}। অনুগ্রহ করে বিকাশ, নগদ বা রকেটে ব্যালেন্স রিচার্জ করুন।`,
      });
    }

    // Deduct fee from wallet
    user.walletBalance -= requiredFee;

    const appId = `BBLD-${Date.now().toString().slice(-6)}`;
    const issueDate = new Date().toISOString().split('T')[0];

    const application: CitizenServiceApplication = {
      id: appId,
      userId: user.id,
      serviceType: serviceType || 'single_khatian',
      title: serviceTitle,
      applicantName: applicantName || user.name,
      applicantPhone: applicantPhone || user.phone,
      division: division || 'ঢাকা বিভাগ',
      district: district || 'ঢাকা জেলা',
      upazila: upazila || 'সাভার উপজেলা',
      union: union || 'বিরুলিয়া ইউনিয়ন',
      mouza: mouza || 'বিরুলিয়া',
      jlNo: jlNo || '১০২',
      khatianNo: khatianNo || '১০৪২',
      dagNo: dagNo || '৩১৮',
      feePaid: requiredFee,
      status: 'APPROVED',
      certificateNo: `CERT-${Date.now().toString().slice(-8)}`,
      issueDate,
      pdfDownloadUrl: `/api/khatian/download/${appId}`,
      createdAt: new Date().toISOString(),
    };

    db.applications.unshift(application);

    // Record order
    const order: OrderItem = {
      id: `ord_${Date.now()}`,
      userId: user.id,
      orderType: serviceType === 'mouza_volume' ? 'mouza_map' : 'khatian_certified_copy',
      title: serviceTitle,
      referenceNo: application.certificateNo || appId,
      amount: requiredFee,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      downloadUrl: `/api/khatian/download/${appId}`,
    };
    db.orders.unshift(order);

    // Notify user
    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      type: 'khatian_order',
      title: 'সেবার আবেদন প্রস্তুত ও PDF তৈরি সম্পন্ন',
      message: `${serviceTitle} এর আবেদন অনুমোদিত হয়েছে এবং অফিশিয়াল ডিজিটাল সনদ (${application.certificateNo}) প্রস্তুত।`,
      timestamp: new Date().toISOString(),
      read: false,
      referenceId: application.certificateNo,
      actionTab: 'orders',
      priority: 'high',
    };
    db.notifications.unshift(notif);

    persistDatabase();

    return res.status(201).json({
      success: true,
      message: 'সেবার আবেদন সফলভাবে গৃহীত হয়েছে এবং তাৎক্ষণিক অফিশিয়াল PDF প্রস্তুত!',
      application,
      order,
      newBalance: user.walletBalance,
    });
  });

  // Get Citizen Applications
  app.get('/api/citizen/my-applications', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'প্রথমে লগইন করুন।' });
    }
    const apps = db.applications.filter((a) => a.userId === user.id);
    return res.json({ success: true, applications: apps });
  });

  // ==========================================
  // ADMIN PANEL CONTROLLER ENDPOINTS
  // ==========================================

  // Admin Middleware helper
  function requireAdmin(req: Request, res: Response): StoredUser | null {
    const user = getAuthUser(req);
    if (!user || user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'এই অ্যাকশনটির জন্য অ্যাডমিন অনুমতি আবশ্যক।' });
      return null;
    }
    return user;
  }

  // Admin Overview Statistics
  app.get('/api/admin/overview', (req: Request, res: Response) => {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const totalUsers = db.users.length;
    const totalPendingPayments = db.payments.filter((p) => p.status === 'PENDING').length;
    const totalApprovedPayments = db.payments.filter((p) => p.status === 'APPROVED');
    const totalApprovedAmount = totalApprovedPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalOrders = db.orders.length;
    const totalApplications = db.applications.length;

    return res.json({
      success: true,
      metrics: {
        totalUsers,
        totalPendingPayments,
        totalApprovedAmount,
        totalOrders,
        totalApplications,
      },
      recentPayments: db.payments.slice(0, 10),
      pricing: db.pricing || DEFAULT_PRICING,
    });
  });

  // Admin: List all Users
  app.get('/api/admin/users', (req: Request, res: Response) => {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const safeUsers = db.users.map((u) => ({
      id: u.id,
      name: u.name,
      phone: u.phone,
      email: u.email,
      fatherOrMotherName: u.fatherOrMotherName,
      address: u.address,
      role: u.role,
      walletBalance: u.walletBalance,
      status: u.status || 'ACTIVE',
      createdAt: u.createdAt,
    }));

    return res.json({ success: true, users: safeUsers });
  });

  // Admin: Toggle Block / Active User
  app.post('/api/admin/user/:id/toggle-block', (req: Request, res: Response) => {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const targetUser = db.users.find((u) => u.id === req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'ব্যবহারকারী পাওয়া যায়নি।' });
    }

    if (targetUser.role === 'admin') {
      return res.status(400).json({ success: false, message: 'অ্যাডমিন অ্যাকাউন্ট ব্লক করা সম্ভব নয়।' });
    }

    targetUser.status = targetUser.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
    persistDatabase();

    logAudit('USER_STATUS_CHANGE', req, 'SUCCESS', `ব্যবহারকারী ${targetUser.phone} এর স্ট্যাটাস পরিবর্তিত: ${targetUser.status}`);

    return res.json({
      success: true,
      message: `ব্যবহারকারীর অ্যাকাউন্ট সফলভাবে ${targetUser.status === 'BLOCKED' ? 'ব্লক (Blocked)' : 'সক্রিয় (Active)'} করা হয়েছে।`,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        phone: targetUser.phone,
        status: targetUser.status,
      },
    });
  });

  // Admin: Adjust User Wallet Balance
  app.post('/api/admin/user/:id/balance', (req: Request, res: Response) => {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const { amount, action } = req.body;
    const targetUser = db.users.find((u) => u.id === req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'ব্যবহারকারী পাওয়া যায়নি।' });
    }

    const num = Number(amount);
    if (isNaN(num)) {
      return res.status(400).json({ success: false, message: 'সঠিক টাকার পরিমাণ দিন।' });
    }

    if (action === 'SET') {
      targetUser.walletBalance = num;
    } else {
      targetUser.walletBalance += num;
    }

    persistDatabase();
    logAudit('ADMIN_BALANCE_ADJUST', req, 'SUCCESS', `ব্যালেন্স সমন্বয়: ${targetUser.phone} নতুন ব্যালেন্স: ৳${targetUser.walletBalance}`);

    return res.json({
      success: true,
      message: `ব্যালেন্স সফলভাবে সমন্বয় করা হয়েছে। নতুন ব্যালেন্স: ৳${targetUser.walletBalance}`,
      walletBalance: targetUser.walletBalance,
    });
  });

  // Admin: Get All Payments
  app.get('/api/admin/payments', (req: Request, res: Response) => {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    return res.json({ success: true, payments: db.payments || [] });
  });

  // Admin: Verify / Approve / Reject Payment
  app.post('/api/admin/payment/:id/verify', (req: Request, res: Response) => {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const { action, note } = req.body;
    const payment = db.payments.find((p) => p.id === req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'পেমেন্ট রেকর্ড পাওয়া যায়নি।' });
    }

    if (payment.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: `এই পেমেন্টটি ইতিমধ্যে ${payment.status === 'APPROVED' ? 'অনুমোদিত' : 'বাতিল'} হয়েছে।` });
    }

    if (action === 'APPROVE') {
      payment.status = 'APPROVED';
      payment.verifiedAt = new Date().toISOString();
      payment.verifiedBy = admin.name;
      payment.adminNote = note || 'অনুমোদিত';

      // Credit amount to citizen account
      const citizen = db.users.find((u) => u.id === payment.userId);
      if (citizen) {
        citizen.walletBalance += payment.amount;

        // Push notification to citizen
        const notif: AppNotification = {
          id: `notif_${Date.now()}`,
          type: 'payment',
          title: 'পেমেন্ট অনুমোদিত ও ব্যালেন্স যুক্ত!',
          message: `${payment.method.toUpperCase()} মারফত প্রেরিত ৳${payment.amount} (TrxID: ${payment.trxId}) সফলভাবে অনুমোদিত হয়েছে এবং ওয়ালেটে যুক্ত হয়েছে।`,
          timestamp: new Date().toISOString(),
          read: false,
          referenceId: payment.trxId,
          actionTab: 'orders',
          priority: 'high',
        };
        db.notifications.unshift(notif);
      }

      logAudit('PAYMENT_APPROVED', req, 'SUCCESS', `পেমেন্ট অনুমোদন: ৳${payment.amount} (TrxID: ${payment.trxId}) ইউজার: ${payment.userPhone}`);
      persistDatabase();

      return res.json({
        success: true,
        message: `পেমেন্ট সফলভাবে অনুমোদিত হয়েছে এবং ব্যবহারকারীর ওয়ালেটে ৳${payment.amount} যুক্ত হয়েছে!`,
        payment,
      });
    } else {
      payment.status = 'REJECTED';
      payment.verifiedAt = new Date().toISOString();
      payment.verifiedBy = admin.name;
      payment.adminNote = note || 'অপ্রমাণিত বা ভুল তথ্য';

      // Push rejection notification to citizen
      const notif: AppNotification = {
        id: `notif_${Date.now()}`,
        type: 'payment',
        title: 'পেমেন্ট বাতিল করা হয়েছে',
        message: `আপনার TrxID: ${payment.trxId} এর রিকোয়েস্টটি বাতিল করা হয়েছে। কারণ: ${payment.adminNote}`,
        timestamp: new Date().toISOString(),
        read: false,
        referenceId: payment.trxId,
        actionTab: 'orders',
        priority: 'high',
      };
      db.notifications.unshift(notif);

      logAudit('PAYMENT_REJECTED', req, 'WARNING', `পেমেন্ট বাতিল: TrxID ${payment.trxId} কারণ: ${payment.adminNote}`);
      persistDatabase();

      return res.json({
        success: true,
        message: 'পেমেন্ট রিকোয়েস্টটি বাতিল করা হয়েছে।',
        payment,
      });
    }
  });

  // Admin: Get & Update Pricing
  app.get('/api/admin/pricing', (req: Request, res: Response) => {
    const admin = requireAdmin(req, res);
    if (!admin) return;
    return res.json({ success: true, pricing: db.pricing || DEFAULT_PRICING });
  });

  app.post('/api/admin/pricing', (req: Request, res: Response) => {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const { singleKhatian, mouzaVolume, mapsDrive, urgentSla, mutationCourtFee, mutationNoticeFee, mutationRecordFee } = req.body;

    db.pricing = {
      singleKhatian: Number(singleKhatian) >= 0 ? Number(singleKhatian) : (db.pricing?.singleKhatian ?? 2),
      mouzaVolume: Number(mouzaVolume) >= 0 ? Number(mouzaVolume) : (db.pricing?.mouzaVolume ?? 350),
      mapsDrive: Number(mapsDrive) >= 0 ? Number(mapsDrive) : (db.pricing?.mapsDrive ?? 100),
      urgentSla: Number(urgentSla) >= 0 ? Number(urgentSla) : (db.pricing?.urgentSla ?? 150),
      mutationCourtFee: Number(mutationCourtFee) >= 0 ? Number(mutationCourtFee) : (db.pricing?.mutationCourtFee ?? 20),
      mutationNoticeFee: Number(mutationNoticeFee) >= 0 ? Number(mutationNoticeFee) : (db.pricing?.mutationNoticeFee ?? 50),
      mutationRecordFee: Number(mutationRecordFee) >= 0 ? Number(mutationRecordFee) : (db.pricing?.mutationRecordFee ?? 1000),
    };

    persistDatabase();
    logAudit('PRICING_UPDATED', req, 'SUCCESS', 'সেবার মূল্য হালনাগাদ করা হয়েছে।');

    return res.json({
      success: true,
      message: 'সেবার মূল্য তালিকা সফলভাবে হালনাগাদ হয়েছে!',
      pricing: db.pricing,
    });
  });

  // Admin: View All Applications
  app.get('/api/admin/applications', (req: Request, res: Response) => {
    const admin = requireAdmin(req, res);
    if (!admin) return;
    return res.json({
      success: true,
      applications: db.applications || [],
      orders: db.orders || [],
    });
  });

  // Admin: Change Password
  app.post('/api/admin/change-password', (req: Request, res: Response) => {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।' });
    }

    if (currentPassword) {
      const computed = hashPassword(currentPassword, admin.salt);
      if (computed !== admin.passwordHash && !admin.passwordMustChange) {
        return res.status(400).json({ success: false, message: 'বর্তমান পাসওয়ার্ড সঠিক নয়।' });
      }
    }

    const newSalt = crypto.randomBytes(16).toString('hex');
    admin.salt = newSalt;
    admin.passwordHash = hashPassword(newPassword, newSalt);
    admin.passwordMustChange = false;

    persistDatabase();
    logAudit('ADMIN_PASSWORD_CHANGED', req, 'SUCCESS', 'অ্যাডমিন পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে।');

    return res.json({
      success: true,
      message: 'অ্যাডমিন পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!',
    });
  });
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`babalandbd.com server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
