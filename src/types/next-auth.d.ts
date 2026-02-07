import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      creditBalance: number;
      subscriptionTier: 'free' | 'lite' | 'standard';
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
    creditBalance?: number;
    subscriptionTier?: 'free' | 'lite' | 'standard';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name: string;
    picture?: string;
    creditBalance?: number;
    subscriptionTier?: 'free' | 'lite' | 'standard';
    isNewUser?: boolean;
    showWelcome?: boolean;
  }
}
