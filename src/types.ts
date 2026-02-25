export interface Chit {
    id: string;
    name: string;
    totalMembers: number;
    divisions: number;
    monthlyAmount: number;
    durationMonths: number;
    startDate: string;
    totalChitValue: number;
    commissionPercent: number;
    commissionAmount: number;
    luckyDrawsPerMonth: number;
    auctionsPerMonth: number;
    status: 'active' | 'completed';
}

export interface LelamEvent {
    id: string;
    type: 'lucky_draw' | 'auction';
    auctionDiscount: number;
}

export interface AuctionSheet {
    id: string;
    chitId: string;
    month: number;
    events: LelamEvent[];
    foremanCommission: number;
    totalDividend: number;
    deductionPerMember: number;
    netMonthlyPay: number;
}

export interface PaymentCollection {
    id: string;
    dateOfPayment: string;
    chitId: string;
    month: number;
    amountDue: number;
    amountCollected: number;
    receivedBy: string;
    status: 'pending' | 'partially_paid' | 'paid';
    submissionTimestamp: string;
}

export interface User {
    username: string;
    isLoggedIn: boolean;
}
