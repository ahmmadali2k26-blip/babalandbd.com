import { KhatianRecord, MutationApplication } from '../types';

export interface LocationHierarchy {
  division: string;
  districts: {
    name: string;
    upazilas: {
      name: string;
      mouzas: { name: string; jlNo: string }[];
    }[];
  }[];
}

export const BANGLADESH_DIVISIONS: LocationHierarchy[] = [
  {
    division: 'ঢাকা (Dhaka)',
    districts: [
      {
        name: 'ঢাকা (Dhaka)',
        upazilas: [
          {
            name: 'ধানমন্ডি (Dhanmondi)',
            mouzas: [
              { name: 'ধানমন্ডি আবাসিক (Dhanmondi Residential)', jlNo: '১২' },
              { name: 'শংকর (Shankar)', jlNo: '১৪' },
              { name: 'রায়েরবাজার (Rayerbazar)', jlNo: '১৫' },
            ],
          },
          {
            name: 'মিরপুর (Mirpur)',
            mouzas: [
              { name: 'সেনপাড়া পর্বতা (Senpara Parbata)', jlNo: '০৬' },
              { name: 'পাইকপাড়া (Paikpara)', jlNo: '০৮' },
              { name: 'কল্যাণপুর (Kalyanpur)', jlNo: '১০' },
            ],
          },
          {
            name: 'সাভার (Savar)',
            mouzas: [
              { name: 'বিরুলিয়া (Birulia)', jlNo: '১০২' },
              { name: 'আশুলিয়া (Ashulia)', jlNo: '১০৫' },
              { name: 'ধামরাই (Dhamrai)', jlNo: '১১০' },
            ],
          },
        ],
      },
      {
        name: 'গাজীপুর (Gazipur)',
        upazilas: [
          {
            name: 'গাজীপুর সদর (Sadar)',
            mouzas: [
              { name: 'জয়দেবপুর (Joydebpur)', jlNo: '৩১' },
              { name: 'চান্দনা (Chandana)', jlNo: '৩৩' },
            ],
          },
          {
            name: 'কালিয়াকৈর (Kaliakair)',
            mouzas: [
              { name: 'চন্দ্রা (Chandra)', jlNo: '৫০' },
              { name: 'মৌচাক (Mouchak)', jlNo: '৫২' },
            ],
          },
        ],
      },
      {
        name: 'নারায়ণগঞ্জ (Narayanganj)',
        upazilas: [
          {
            name: 'নারায়ণগঞ্জ সদর (Sadar)',
            mouzas: [
              { name: 'সিদ্ধিরগঞ্জ (Siddhirganj)', jlNo: '৪৫' },
              { name: 'ফতুল্লা (Fatullah)', jlNo: '৪৭' },
            ],
          },
        ],
      },
    ],
  },
  {
    division: 'চট্টগ্রাম (Chattogram)',
    districts: [
      {
        name: 'চট্টগ্রাম (Chattogram)',
        upazilas: [
          {
            name: 'পাঁচলাইশ (Panchlaish)',
            mouzas: [
              { name: 'নাসিরাবাদ (Nasirabad)', jlNo: '২২' },
              { name: 'মুরাদপুর (Muradpur)', jlNo: '২৪' },
            ],
          },
          {
            name: 'পটিয়া (Patiya)',
            mouzas: [
              { name: 'কুসুমপুরা (Kusumpura)', jlNo: '৬১' },
              { name: 'খরনা (Kharna)', jlNo: '৬৩' },
            ],
          },
        ],
      },
      {
        name: 'কক্সবাজার (Cox\'s Bazar)',
        upazilas: [
          {
            name: 'কক্সবাজার সদর (Sadar)',
            mouzas: [
              { name: 'ঝিলংজা (Jhilongja)', jlNo: '১৮' },
              { name: 'পিএমখালী (PM Khali)', jlNo: '২০' },
            ],
          },
        ],
      },
      {
        name: 'কুমিল্লা (Cumilla)',
        upazilas: [
          {
            name: 'কুমিল্লা সদর (Sadar)',
            mouzas: [
              { name: 'টমছম ব্রিজ (Tomsom Bridge)', jlNo: '১৪' },
              { name: 'কান্দিরপাড় (Kandirpar)', jlNo: '১৬' },
            ],
          },
        ],
      },
    ],
  },
  {
    division: 'রাজশাহী (Rajshahi)',
    districts: [
      {
        name: 'রাজশাহী (Rajshahi)',
        upazilas: [
          {
            name: 'বোয়ালিয়া (Boalia)',
            mouzas: [
              { name: 'হেতেম খাঁ (Hetem Kha)', jlNo: '০৪' },
              { name: 'সাগরপাড়া (Sagarpara)', jlNo: '০৬' },
            ],
          },
          {
            name: 'পবা (Paba)',
            mouzas: [
              { name: 'নওহাটা (Nowhata)', jlNo: '২৬' },
              { name: 'দামকুড়া (Damkura)', jlNo: '২৮' },
            ],
          },
        ],
      },
      {
        name: 'বগুড়া (Bogura)',
        upazilas: [
          {
            name: 'বগুড়া সদর (Sadar)',
            mouzas: [
              { name: 'ফুলবাড়ী (Fulbari)', jlNo: '৩১' },
              { name: 'মালতিনগর (Maltinagar)', jlNo: '৩৩' },
            ],
          },
        ],
      },
    ],
  },
  {
    division: 'সিলেট (Sylhet)',
    districts: [
      {
        name: 'সিলেট (Sylhet)',
        upazilas: [
          {
            name: 'সিলেট সদর (Sadar)',
            mouzas: [
              { name: 'আম্বরখানা (Amberkhana)', jlNo: '১১' },
              { name: 'উপশহর (Uposhohor)', jlNo: '১৩' },
            ],
          },
        ],
      },
    ],
  },
  {
    division: 'খুলনা (Khulna)',
    districts: [
      {
        name: 'খুলনা (Khulna)',
        upazilas: [
          {
            name: 'খালিশপুর (Khalishpur)',
            mouzas: [
              { name: 'মুজগুন্নী (Muzgunni)', jlNo: '০৯' },
              { name: 'বৈকালী (Baikali)', jlNo: '১১' },
            ],
          },
        ],
      },
    ],
  },
  {
    division: 'বরিশাল (Barishal)',
    districts: [
      {
        name: 'বরিশাল (Barishal)',
        upazilas: [
          {
            name: 'বরিশাল সদর (Sadar)',
            mouzas: [
              { name: 'বগুড়া রোড (Bogura Road)', jlNo: '০৫' },
              { name: 'রূপাতলী (Rupatali)', jlNo: '০৮' },
            ],
          },
        ],
      },
    ],
  },
  {
    division: 'রংপুর (Rangpur)',
    districts: [
      {
        name: 'রংপুর (Rangpur)',
        upazilas: [
          {
            name: 'রংপুর সদর (Sadar)',
            mouzas: [
              { name: 'ধাপ (Dhap)', jlNo: '০৩' },
              { name: 'কেরানীপাড়া (Keranipara)', jlNo: '০৬' },
            ],
          },
        ],
      },
    ],
  },
  {
    division: 'ময়মনসিংহ (Mymensingh)',
    districts: [
      {
        name: 'ময়মনসিংহ (Mymensingh)',
        upazilas: [
          {
            name: 'ময়মনসিংহ সদর (Sadar)',
            mouzas: [
              { name: 'গাঙ্গিনারপাড় (Ganginarpar)', jlNo: '০২' },
              { name: 'চরপাড়া (Charpara)', jlNo: '০৪' },
            ],
          },
        ],
      },
    ],
  },
];

export const INITIAL_KHATIAN_RECORDS: KhatianRecord[] = [
  {
    id: 'kh-dhaka-1042',
    khatianNo: '১০৪২',
    surveyType: 'BS',
    division: 'ঢাকা (Dhaka)',
    district: 'ঢাকা (Dhaka)',
    upazila: 'ধানমন্ডি (Dhanmondi)',
    mouza: 'ধানমন্ডি আবাসিক (Dhanmondi Residential)',
    jlNo: '১২',
    toujiNo: '৩৪৮/ক',
    pargana: 'বাওয়ালী',
    owners: [
      {
        name: 'মোঃ আফজাল হোসেন',
        fatherOrSpouse: 'পিতা: মৃত আব্দুল করিম',
        share: '০.৫০০০',
        nidLast4: '৮৪২৯',
      },
      {
        name: 'মোসাম্মৎ পারভীন আক্তার',
        fatherOrSpouse: 'স্বামী: মোঃ আফজাল হোসেন',
        share: '০.৫০০০',
        nidLast4: '১৯৩১',
      },
    ],
    plots: [
      {
        dagNo: '৩১৮',
        landClass: 'বাস্তু / আবাসিক',
        totalAreaAcre: 0.12,
        totalAreaDecimal: 12.0,
        shareAreaDecimal: 12.0,
        annualTax: 120,
      },
      {
        dagNo: '৩২০',
        landClass: 'পুকুর / জলাশয়',
        totalAreaAcre: 0.05,
        totalAreaDecimal: 5.0,
        shareAreaDecimal: 5.0,
        annualTax: 50,
      },
    ],
    totalLandDecimal: 17.0,
    totalAnnualTax: 170,
    kistibandi: 'বৈশাখ ও কার্তিক কিস্তিতে প্রদেয়',
    issueDate: '২০২৩-০৮-১৫',
    qrCodeData: 'https://babalandbd.com/verify?id=kh-dhaka-1042&hash=sha256_8f912c9a',
    isCertifiedAvailable: true,
    certifiedFee: 2,
  },
  {
    id: 'kh-dhaka-2105',
    khatianNo: '২১০৫',
    surveyType: 'RS',
    division: 'ঢাকা (Dhaka)',
    district: 'ঢাকা (Dhaka)',
    upazila: 'মিরপুর (Mirpur)',
    mouza: 'সেনপাড়া পর্বতা (Senpara Parbata)',
    jlNo: '০৬',
    toujiNo: '১২০/খ',
    owners: [
      {
        name: 'আব্দুর রহিম শেখ',
        fatherOrSpouse: 'পিতা: হাবিবুর রহমান শেখ',
        share: '১.০০০০',
        nidLast4: '৭৭২1',
      },
    ],
    plots: [
      {
        dagNo: '৫০৪',
        landClass: 'ভিটি / বাণিজ্যিক',
        totalAreaAcre: 0.08,
        totalAreaDecimal: 8.5,
        shareAreaDecimal: 8.5,
        annualTax: 250,
      },
    ],
    totalLandDecimal: 8.5,
    totalAnnualTax: 250,
    kistibandi: 'এককালীন পরিশোধযোগ্য',
    issueDate: '২০২২-১১-২০',
    qrCodeData: 'https://babalandbd.com/verify?id=kh-dhaka-2105&hash=sha256_bb931d',
    isCertifiedAvailable: true,
    certifiedFee: 2,
  },
  {
    id: 'kh-savar-504',
    khatianNo: '৫০৪',
    surveyType: 'BS',
    division: 'ঢাকা (Dhaka)',
    district: 'ঢাকা (Dhaka)',
    upazila: 'সাভার (Savar)',
    mouza: 'বিরুলিয়া (Birulia)',
    jlNo: '১০২',
    toujiNo: '৭৭২',
    owners: [
      {
        name: 'মোঃ তারিকুল ইসলাম বাবুল',
        fatherOrSpouse: 'পিতা: মোস্তাফিজুর রহমান',
        share: '০.৭৫০০',
        nidLast4: '৪৪০৯',
      },
      {
        name: 'সুলতানা রাজিয়া',
        fatherOrSpouse: 'পিতা: মোস্তাফিজুর রহমান',
        share: '০.২৫০০',
        nidLast4: '৬৭২০',
      },
    ],
    plots: [
      {
        dagNo: '১২০৫',
        landClass: 'নাল / ধানী',
        totalAreaAcre: 0.45,
        totalAreaDecimal: 45.0,
        shareAreaDecimal: 45.0,
        annualTax: 90,
      },
      {
        dagNo: '১২০৬',
        landClass: 'বাগান',
        totalAreaAcre: 0.15,
        totalAreaDecimal: 15.0,
        shareAreaDecimal: 15.0,
        annualTax: 45,
      },
    ],
    totalLandDecimal: 60.0,
    totalAnnualTax: 135,
    kistibandi: 'প্রতি বছর চৈত্র মাসের মধ্যে পরিশোধযোগ্য',
    issueDate: '২০২৪-০৩-১০',
    qrCodeData: 'https://babalandbd.com/verify?id=kh-savar-504&hash=sha256_e81c0',
    isCertifiedAvailable: true,
    certifiedFee: 2,
  },
  {
    id: 'kh-ctg-312',
    khatianNo: '৩১২',
    surveyType: 'CS',
    division: 'চট্টগ্রাম (Chattogram)',
    district: 'চট্টগ্রাম (Chattogram)',
    upazila: 'পাঁচলাইশ (Panchlaish)',
    mouza: 'নাসিরাবাদ (Nasirabad)',
    jlNo: '২২',
    toujiNo: '৪১৫',
    owners: [
      {
        name: 'চৌধুরী সামসুল আলম',
        fatherOrSpouse: 'পিতা: মরহুম বখতিয়ার খাঁ',
        share: '১.০০০০',
        nidLast4: '১১২০',
      },
    ],
    plots: [
      {
        dagNo: '৮৯',
        landClass: 'পাকা বাড়ি',
        totalAreaAcre: 0.18,
        totalAreaDecimal: 18.25,
        shareAreaDecimal: 18.25,
        annualTax: 450,
      },
    ],
    totalLandDecimal: 18.25,
    totalAnnualTax: 450,
    kistibandi: 'বাৎসরিক কিস্তিতে প্রদেয়',
    issueDate: '২০২১-০৫-১৪',
    qrCodeData: 'https://babalandbd.com/verify?id=kh-ctg-312&hash=sha256_7781a',
    isCertifiedAvailable: true,
    certifiedFee: 2,
  },
  {
    id: 'kh-raj-88',
    khatianNo: '৮৮',
    surveyType: 'SA',
    division: 'রাজশাহী (Rajshahi)',
    district: 'রাজশাহী (Rajshahi)',
    upazila: 'বোয়ালিয়া (Boalia)',
    mouza: 'হেতেম খাঁ (Hetem Kha)',
    jlNo: '০৪',
    toujiNo: '১০৩',
    owners: [
      {
        name: 'প্রফেসর ড. মাহমুদুর রহমান',
        fatherOrSpouse: 'পিতা: কাজী নুরুল হুদা',
        share: '০.৫০০০',
        nidLast4: '৬৬৫০',
      },
      {
        name: 'বেগম নাসরিন সুলতানা',
        fatherOrSpouse: 'স্বামী: ড. মাহমুদুর রহমান',
        share: '০.৫০০০',
        nidLast4: '৩৩৯৮',
      },
    ],
    plots: [
      {
        dagNo: '১৪৫',
        landClass: 'আবাসিক ভবন',
        totalAreaAcre: 0.10,
        totalAreaDecimal: 10.0,
        shareAreaDecimal: 10.0,
        annualTax: 200,
      },
    ],
    totalLandDecimal: 10.0,
    totalAnnualTax: 200,
    kistibandi: 'ষাণ্মাসিক কিস্তি',
    issueDate: '২০২০-১০-০১',
    qrCodeData: 'https://babalandbd.com/verify?id=kh-raj-88&hash=sha256_aa129',
    isCertifiedAvailable: true,
    certifiedFee: 2,
  },
];

export const INITIAL_MUTATIONS: MutationApplication[] = [
  {
    id: 'mut-2026-9041',
    applicationNo: 'MUT-2026-9041',
    applicantName: 'মোঃ জামান হোসেন',
    applicantPhone: '01711223344',
    applicantNid: '19875412365478901',
    division: 'ঢাকা (Dhaka)',
    district: 'ঢাকা (Dhaka)',
    upazila: 'সাভার (Savar)',
    mouza: 'বিরুলিয়া (Birulia)',
    jlNo: '১০২',
    deedNo: '৪৫০২/২০২৬',
    deedDate: '২০২৬-০২-১৫',
    formerKhatianNo: '৫০৪',
    proposedDagNo: '১২০৫',
    proposedAreaDecimal: 15.0,
    submissionDate: '২০২৬-০৩-০১',
    status: 'HEARING_SCHEDULED',
    hearingDate: '২০২৬-১১-১৫',
    dcrFeePaid: true,
    stages: [
      {
        stageNumber: 1,
        title: 'অনলাইন আবেদন গ্রহণ',
        description: 'আবেদন ও প্রয়োজনীয় দলিল সহকারী কমিশনার (ভূমি) দপ্তরে জমা হয়েছে।',
        completed: true,
        date: '২০২৬-০৩-০১ ১০:৩০ AM',
      },
      {
        stageNumber: 2,
        title: 'সহকারী কমিশনার (ভূমি) প্রাথমিক যাচাই',
        description: 'আবেদনের সকল কাগজপত্র ও সাবেক খতিয়ানের বৈধতা যাচাই সম্পন্ন হয়েছে।',
        completed: true,
        date: '২০২৬-০৩-০৪ ০২:১৫ PM',
      },
      {
        stageNumber: 3,
        title: 'ইউনিয়ন ভূমি সহকারী কর্মকর্তা তদন্ত',
        description: 'সরেজমিন পরিদর্শন ও দখল সংক্রান্ত প্রতিবেদন দাখিল করা হয়েছে।',
        completed: true,
        date: '২০২৬-০৩-১০ ১১:০০ AM',
      },
      {
        stageNumber: 4,
        title: 'শুনানি ও ডিসিআর (DCR) ফি',
        description: 'শুনানির তারিখ ধার্য: ১৫ নভেম্বর ২০২৬। ডিসিআর ফি ১,১০০/- টাকা পরিশোধিত।',
        completed: true,
        date: '২০২৬-০৩-১৮ ০৩:৪৫ PM',
      },
      {
        stageNumber: 5,
        title: 'চূড়ান্ত নামজারি খতিয়ান মঞ্জুর',
        description: 'শুনানি অন্তে নয়া নামজারি খতিয়ান প্রিন্ট ও অনুমোদন প্রক্রিয়াধীন।',
        completed: false,
      },
    ],
  },
  {
    id: 'mut-2026-7712',
    applicationNo: 'MUT-2026-7712',
    applicantName: 'রোকেয়া বেগম',
    applicantPhone: '01899887766',
    applicantNid: '19921234567890123',
    division: 'ঢাকা (Dhaka)',
    district: 'ঢাকা (Dhaka)',
    upazila: 'ধানমন্ডি (Dhanmondi)',
    mouza: 'ধানমন্ডি আবাসিক (Dhanmondi Residential)',
    jlNo: '১২',
    deedNo: '১২৮০/২০২৫',
    deedDate: '২০২৫-১২-১০',
    formerKhatianNo: '১০৪২',
    proposedDagNo: '৩১৮',
    proposedAreaDecimal: 6.0,
    submissionDate: '২০২৬-০১-১২',
    status: 'APPROVED',
    dcrFeePaid: true,
    stages: [
      {
        stageNumber: 1,
        title: 'অনলাইন আবেদন গ্রহণ',
        description: 'আবেদন গৃহীত ও ট্র্যাকিং নম্বর জেনারেট হয়েছে।',
        completed: true,
        date: '২০২৬-০১-১২',
      },
      {
        stageNumber: 2,
        title: 'কাগজপত্র যাচাই',
        description: 'উপ-রেজিস্ট্রি দলিলের তথ্যের সাথে মূল রেকর্ডের মিল পাওয়া গেছে।',
        completed: true,
        date: '২০২৬-০১-১৬',
      },
      {
        stageNumber: 3,
        title: 'তদন্ত প্রতিবেদন দাখিল',
        description: 'দখলকারী হিসেবে আবেদনকারীর দখল প্রমাণিত।',
        completed: true,
        date: '২০২৬-০১-২২',
      },
      {
        stageNumber: 4,
        title: 'শুনানি ও অনুমোদন',
        description: 'সহকারী কমিশনার (ভূমি) কর্তৃক আবেদন অনুমোদিত।',
        completed: true,
        date: '২০২৬-০১-৩০',
      },
      {
        stageNumber: 5,
        title: 'অনলাইন খতিয়ান প্রদান',
        description: 'খতিয়ান নং ৯৮২০ অনুমোদন সাপেক্ষে সক্রিয় হয়েছে। ডাউনলোড প্রস্তুত।',
        completed: true,
        date: '২০২৬-০২-০২',
      },
    ],
  },
];
