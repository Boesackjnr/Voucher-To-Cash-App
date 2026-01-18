
export type Screen = 'SPLASH' | 'ONBOARDING' | 'SIGNIN' | 'DASHBOARD' | 'CONVERT_AIRTIME' | 'CONVERT_VOUCHER' | 'WITHDRAW' | 'HISTORY' | 'PROFILE';

export interface Transaction {
  id: string;
  type: 'Voucher' | 'Airtime' | 'Withdrawal';
  amount: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  date: string;
  provider?: string;
}

export interface User {
  name: string;
  email: string;
  balance: number;
  isVerified: boolean;
}
