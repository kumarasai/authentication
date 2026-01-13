import React, { useState, useEffect, createContext, useContext } from 'react';
import './App.css';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { auth } from './firebase';

// Auth Context
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    return signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Simple Router Implementation
const Router = ({ children }) => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

const RouterContext = createContext(null);

const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) throw new Error('useRouter must be used within Router');
  return context;
};

// Protected Route Component

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { navigate } = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/sign-in');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? children : null;
};



const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { navigate } = useRouter();

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return !user ? children : null;
};


//signin page

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password || password.length < 6) {
      setError('Please enter a valid email and password (min 6 characters)');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-page">
      <div className="signin-card">
        <div className="signin-header">
          <h1 className="signin-title">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="signin-subtitle">
            {isSignUp ? 'Sign up to get started' : 'Sign in to your account'}
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-container">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="form-input"
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="form-input"
              placeholder="••••••••"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <span className="btn-loading">
                <div className="spinner-small"></div>
                Processing...
              </span>
            ) : (
              isSignUp ? 'Sign Up' : 'Sign In'
            )}
          </button>
        </div>

        <div className="toggle-link">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="btn-secondary"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Dashboard Page

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { navigate } = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      navigate('/sign-in');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <nav className="dashboard-nav">
        <div className="dashboard-nav-content">
          <h1 className="dashboard-nav-title">Dashboard</h1>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="btn-logout"
          >
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </nav>

      <main className="dashboard-main">
        <div className="dashboard-card">
          <div className="user-header">
            <div className="user-avatar">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="user-info-title">Welcome!</h2>
              <p className="user-info-subtitle">You're successfully logged in</p>
            </div>
          </div>

          <div className="email-display">
            <h3 className="email-label">User Email</h3>
            <p className="email-value">{user?.email}</p>
          </div>

          <div className="feature-grid">
            <div className="feature-card feature-card-blue">
              <h4 className="feature-title">Protected Route</h4>
              <p className="feature-description">This page is only accessible when authenticated</p>
            </div>
            <div className="feature-card feature-card-purple">
              <h4 className="feature-title">Session Persistence</h4>
              <p className="feature-description">Your login persists across page refreshes</p>
            </div>
            <div className="feature-card feature-card-pink">
              <h4 className="feature-title">Secure Authentication</h4>
              <p className="feature-description">Powered by Firebase Authentication</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Main App Component
const App = () => {
  const { currentPath } = useRouter();

  return (
    <div>
      {currentPath === '/sign-in' && (
        <PublicRoute>
          <SignInPage />
        </PublicRoute>
      )}
      {currentPath === '/' && (
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      )}
      {currentPath !== '/' && currentPath !== '/sign-in' && (
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      )}
    </div>
  );
};

// Root Component
export default function Root() {
  return (
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  );
}