import React, { createContext, useEffect, useState } from 'react';
import {
  apiFetchCurrentSession,
  apiGoogleAuth,
  apiLoginUser,
  apiLogoutUser,
  apiRegisterUser,
  saveStudentProfile,
  setStoredAccessToken,
} from '../services/api.ts';
import {
  AcademicYear,
  StudentProfile,
  validateStudentProfileInput,
} from '../utils/validation.ts';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  academicYear?: AcademicYear;
  division?: string;
  college?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  profile: StudentProfile | null;
  isProfileComplete: boolean;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<StudentProfile | null>;
  registerWithEmail: (payload: RegisterPayload) => Promise<StudentProfile | null>;
  signInWithGoogle: (googleProfile: {
    email: string;
    fullName: string;
  }) => Promise<StudentProfile | null>;
  saveProfile: (input: {
    fullName: string;
    email: string;
    academicYear: AcademicYear;
    division: string;
    college: string;
  }) => Promise<StudentProfile>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    apiFetchCurrentSession()
      .then((sessionData) => {
        if (!active) return;
        if (sessionData) {
          setUser(sessionData.user);
          setProfile(sessionData.student);
        } else {
          setUser(null);
          setProfile(null);
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
          setProfile(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const loginWithEmail = async (
    email: string,
    password: string
  ): Promise<StudentProfile | null> => {
    const res = await apiLoginUser({ email: email.trim(), password });
    setStoredAccessToken(res.session.accessToken);
    setUser(res.user);
    setProfile(res.student);
    return res.student;
  };

  const registerWithEmail = async (
    payload: RegisterPayload
  ): Promise<StudentProfile | null> => {
    const res = await apiRegisterUser(payload);
    setStoredAccessToken(res.session.accessToken);
    setUser(res.user);
    setProfile(res.student);
    return res.student;
  };

  const signInWithGoogle = async (googleProfile: {
    email: string;
    fullName: string;
  }): Promise<StudentProfile | null> => {
    const res = await apiGoogleAuth(googleProfile);
    setStoredAccessToken(res.session.accessToken);
    setUser(res.user);
    setProfile(res.student);
    return res.student;
  };

  const saveProfile = async (input: {
    fullName: string;
    email: string;
    academicYear: AcademicYear;
    division: string;
    college: string;
  }): Promise<StudentProfile> => {
    if (!user) {
      throw new Error('You must be signed in to save your student profile.');
    }

    const validationError = validateStudentProfileInput(input);
    if (validationError) {
      throw new Error(validationError);
    }

    const saved = await saveStudentProfile(input);
    setProfile(saved);
    setUser((prev) => (prev ? { ...prev, fullName: saved.fullName } : prev));
    return saved;
  };

  const logout = async () => {
    await apiLogoutUser();
    setUser(null);
    setProfile(null);
  };

  const isProfileComplete = Boolean(
    profile &&
      profile.fullName &&
      profile.academicYear &&
      profile.division &&
      profile.college
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isProfileComplete,
        loading,
        loginWithEmail,
        registerWithEmail,
        signInWithGoogle,
        saveProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
