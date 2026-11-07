export type SurveyType = 'BS' | 'RS' | 'CS' | 'SA' | 'City' | 'Mutation';

export interface LandOwner {
  name: string;
  fatherOrSpouse: string;
  share: string; // e.g. "০.২৫০০" or "1/4"
  nidLast4?: string;
}

export interface DagPlot {
  dagNo: string;
  landClass: string; // e.g. নাল, ভিটি, ধানী, পুকুর, বাড়ি, কান্দা
  totalAreaAcre: number;
  totalAreaDecimal: number;
  shareAreaDecimal: number;
  annualTax: number;
}

export interface KhatianRecord {
  id: string;
  khatianNo: string;
  surveyType: SurveyType;
  division: string;
  district: string;
  upazila: string;
  mouza: string;
  jlNo: string;
  toujiNo: string;
  pargana?: string;
  owners: LandOwner[];
  plots: DagPlot[];
  totalLandDecimal: number;
  totalAnnualTax: number;
  kistibandi: string; // কিস্তিবন্দি বিবরণ
  issueDate: string;
  qrCodeData: string;
  isCertifiedAvailable: boolean;
  certifiedFee: number;
}

export interface MutationApplication {
  id: string;
  applicationNo: string;
  applicantName: string;
  applicantPhone: string;
  applicantNid: string;
  division: string;
  district: string;
  upazila: string;
  mouza: string;
  jlNo: string;
  deedNo: string;
  deedDate: string;
  formerKhatianNo: string;
  proposedDagNo: string;
  proposedAreaDecimal: number;
  submissionDate: string;
  status: 'SUBMITTED' | 'AC_LAND_VERIFIED' | 'SURVEYOR_REPORTED' | 'HEARING_SCHEDULED' | 'APPROVED' | 'REJECTED';
  hearingDate?: string;
  dcrFeePaid: boolean;
  stages: {
    stageNumber: number;
    title: string;
    description: string;
    completed: boolean;
    date?: string;
  }[];
}

export interface LandTaxAssessment {
  holdingNo: string;
  division: string;
  district: string;
  upazila: string;
  mouza: string;
  ownerName: string;
  landType: 'agricultural' | 'residential' | 'commercial' | 'industrial';
  areaDecimal: number;
  dueYears: number;
  currentYearTax: number;
  arrearsTax: number;
  interest: number;
  totalPayable: number;
}

export interface TaxDakhilaReceipt {
  dakhilaNo: string;
  holdingNo: string;
  payerName: string;
  payerMobile: string;
  paidAmount: number;
  paymentMethod: string;
  transactionId: string;
  paymentDate: string;
  financialYear: string;
  mouza: string;
  jlNo: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  fatherOrMotherName?: string;
  address?: string;
  role: 'citizen' | 'entrepreneur' | 'admin';
  walletBalance: number;
  status?: 'ACTIVE' | 'BLOCKED';
  passwordMustChange?: boolean;
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  method: 'bkash' | 'nagad' | 'rocket';
  receiverNumber: string; // '01320507383'
  senderPhone: string;
  amount: number;
  trxId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
}

export interface ServicePriceConfig {
  singleKhatian: number;
  mouzaVolume: number;
  mapsDrive: number;
  urgentSla: number;
  mutationCourtFee: number;
  mutationNoticeFee: number;
  mutationRecordFee: number;
}

export interface CitizenServiceApplication {
  id: string;
  userId: string;
  serviceType: 'single_khatian' | 'mouza_volume' | 'maps_drive' | 'mutation' | 'land_tax';
  title: string;
  applicantName: string;
  applicantPhone: string;
  division: string;
  district: string;
  upazila: string;
  union?: string;
  mouza: string;
  jlNo: string;
  khatianNo?: string;
  dagNo?: string;
  feePaid: number;
  status: 'PENDING' | 'PROCESSING' | 'APPROVED' | 'REJECTED';
  certificateNo?: string;
  issueDate?: string;
  pdfDownloadUrl?: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  userId: string;
  orderType: 'khatian_certified_copy' | 'mouza_map' | 'mutation_fee' | 'ld_tax';
  title: string;
  referenceNo: string;
  amount: number;
  status: 'COMPLETED' | 'PROCESSING';
  createdAt: string;
  downloadUrl?: string;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  action: string;
  ip: string;
  userAgent: string;
  status: 'SUCCESS' | 'WARNING' | 'BLOCKED';
  details: string;
}

export interface AppNotification {
  id: string;
  type: 'mutation_update' | 'khatian_order' | 'tax_dakhila' | 'system' | 'payment';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  referenceId?: string;
  actionTab?: string;
  priority?: 'high' | 'normal';
}

