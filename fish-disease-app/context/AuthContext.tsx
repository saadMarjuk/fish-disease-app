import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  isPremium: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  isPremium: false,
  loading: true,
  logout: async () => {},
  refreshUserData: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUserData = async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      setUser(null);
      setIsPremium(false);
      return;
    }

    setUser(firebaseUser);

    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        setIsPremium(!!userData?.isPremium);
      } else {
        setIsPremium(false);
      }
    } catch (error) {
      console.log('Error loading user data:', error);
      setIsPremium(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true);
        await loadUserData(firebaseUser);
      } catch (error) {
        console.log('Auth state error:', error);
        setUser(null);
        setIsPremium(false);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsPremium(false);
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const refreshUserData = async () => {
    try {
      setLoading(true);
      await loadUserData(auth.currentUser);
    } catch (error) {
      console.log('Refresh user data error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isPremium,
        loading,
        logout,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);