import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  signInAnonymously,
  updateProfile,
} from 'firebase/auth';
import { auth, testConnection } from '../firebase/config';
import { AppUser, UserRole } from '../types/maritime';
import { seedInitialDataIfEmpty } from '../services/maritimeService';

interface AuthContextType {
  currentUser: AppUser | null;
  firebaseUser: User | null;
  loading: boolean;
  dbConnected: boolean;
  loginWithEmail: (email: string, pass: string, role?: UserRole) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, role?: UserRole) => Promise<void>;
  loginWithGoogle: (role?: UserRole) => Promise<void>;
  loginAsDemoAdmin: (role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole) => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize and check connection
  useEffect(() => {
    let isMounted = true;

    async function initDb() {
      const connected = await testConnection();
      if (isMounted) setDbConnected(connected);
    }
    initDb();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;
      setFirebaseUser(user);
      if (user) {
        // Retrieve cached or assigned role
        const savedRole = (localStorage.getItem(`user_role_${user.uid}`) as UserRole) || 'super_admin';
        const appUser: AppUser = {
          uid: user.uid,
          email: user.email || 'operator@maritimx.co.id',
          displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Admin Pelayaran'),
          role: savedRole,
        };
        setCurrentUser(appUser);
        // Ensure database has default data
        await seedInitialDataIfEmpty(user.email || 'admin@maritimx.co.id');
      } else {
        // Check if there is a simulated session when offline or before auth
        const savedFallback = localStorage.getItem('maritimx_saved_user');
        if (savedFallback) {
          try {
            const parsed = JSON.parse(savedFallback);
            setCurrentUser(parsed);
          } catch {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const loginWithEmail = async (email: string, pass: string, role: UserRole = 'super_admin') => {
    setError(null);
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      localStorage.setItem(`user_role_${cred.user.uid}`, role);
      localStorage.removeItem('maritimx_saved_user');
    } catch (err: any) {
      console.warn('Firebase email auth note:', err.code, err.message);
      // If user doesn't exist yet, try creating it automatically for a smooth first admin onboarding!
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, pass);
          await updateProfile(cred.user, { displayName: email.split('@')[0] });
          localStorage.setItem(`user_role_${cred.user.uid}`, role);
          localStorage.removeItem('maritimx_saved_user');
          return;
        } catch (createErr: any) {
          // If email/password provider is not toggled on yet in Firebase Console
          if (createErr.code === 'auth/operation-not-allowed' || createErr.code === 'auth/admin-restricted-operation') {
            await fallbackAuth(email, role);
            return;
          }
          setError(createErr.message || 'Gagal login atau membuat akun admin.');
          throw createErr;
        }
      } else if (err.code === 'auth/operation-not-allowed') {
        // Email/Password provider not enabled in console -> fallback to anonymous/custom session
        await fallbackAuth(email, role);
      } else {
        setError(err.message || 'Login gagal. Periksa email & password.');
        throw err;
      }
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string, role: UserRole = 'ops_manager') => {
    setError(null);
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(cred.user, { displayName: name });
      localStorage.setItem(`user_role_${cred.user.uid}`, role);
      localStorage.removeItem('maritimx_saved_user');
    } catch (err: any) {
      console.warn('Register error:', err.code, err.message);
      if (err.code === 'auth/operation-not-allowed') {
        await fallbackAuth(email, role, name);
      } else {
        setError(err.message || 'Gagal mendaftar akun baru.');
        throw err;
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (role: UserRole = 'super_admin') => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      localStorage.setItem(`user_role_${result.user.uid}`, role);
      localStorage.removeItem('maritimx_saved_user');
    } catch (err: any) {
      console.warn('Google sign-in note:', err);
      setError(err.message || 'Gagal masuk dengan akun Google.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fallbackAuth = async (email: string, role: UserRole, name?: string) => {
    try {
      // Try anonymous sign in so Firebase rules allow reads & writes
      const anon = await signInAnonymously(auth);
      const appUser: AppUser = {
        uid: anon.user.uid,
        email: email,
        displayName: name || email.split('@')[0],
        role,
      };
      localStorage.setItem(`user_role_${anon.user.uid}`, role);
      setCurrentUser(appUser);
      await seedInitialDataIfEmpty(email);
    } catch (anonErr) {
      console.warn('Anon sign-in fallback:', anonErr);
      const fallbackUser: AppUser = {
        uid: 'user_' + Date.now(),
        email: email,
        displayName: name || email.split('@')[0],
        role,
      };
      localStorage.setItem('maritimx_saved_user', JSON.stringify(fallbackUser));
      setCurrentUser(fallbackUser);
    }
  };

  const loginAsDemoAdmin = async (role: UserRole = 'super_admin') => {
    await loginWithEmail('admin@pelayaran-maritimx.co.id', 'Maritim2026#Secure', role);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Sign out warning:', err);
    }
    localStorage.removeItem('maritimx_saved_user');
    setCurrentUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (currentUser) {
      const updated = { ...currentUser, role: newRole };
      setCurrentUser(updated);
      localStorage.setItem(`user_role_${currentUser.uid}`, newRole);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        loading,
        dbConnected,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        loginAsDemoAdmin,
        logout,
        switchRole,
        error,
        clearError: () => setError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
