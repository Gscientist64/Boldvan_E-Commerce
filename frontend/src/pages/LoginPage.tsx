// frontend/src/pages/LoginPage.tsx

import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import PasswordStrength from '@/components/PasswordStrength';
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Home,
  Zap,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000/api';

const LoginPage: React.FC = () => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(loginEmail, loginPassword);
      navigate('/');
    } catch (err: any) {
      if (err.requiresOtp) {
        navigate(`/verify-otp?email=${encodeURIComponent(err.email || loginEmail)}`);
        return;
      }
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!agreeTerms) {
      setError('Please agree to the Terms & Privacy Policy');
      return;
    }
    setIsLoading(true);
    try {
      await register({ email: regEmail, password: regPassword, firstName: regFirstName, lastName: regLastName, phone: regPhone });
      navigate(`/verify-otp?email=${encodeURIComponent(regEmail)}`);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = useCallback(async (credentialResponse: any) => {
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Google sign-in failed');
      localStorage.setItem('token', data.token);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-8 overflow-hidden relative">
      {/* Top decorative bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-boldvan-500 to-emerald-500" />

      {/* Subtle background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-32 w-72 h-72 bg-teal-500/[0.04] rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-32 w-72 h-72 bg-boldvan-500/[0.04] rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/20">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-wide">
              BOLD<span className="text-teal-600">VAN</span>
            </h1>
            <p className="text-[10px] text-slate-400 tracking-wider uppercase">Smart Tech, Clean Power</p>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-center text-slate-400 text-xs mb-5"
        >
          Power your world with reliable energy solutions
        </motion.p>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white border border-slate-200 shadow-xl shadow-slate-200/50">
            <div className="h-1 w-full bg-gradient-to-r from-teal-500 via-boldvan-500 to-emerald-500 rounded-t-xl" />

            <CardHeader className="pb-1 pt-5 px-6">
              <CardTitle className="text-lg text-center text-slate-800">
                {activeTab === 'login' ? 'Welcome Back' : 'Join BOLDVAN'}
              </CardTitle>
              <p className="text-center text-[11px] text-slate-500 mt-0.5">
                {activeTab === 'login'
                  ? 'Sign in to access your account'
                  : 'Create an account and start your journey'}
              </p>
            </CardHeader>

            <CardContent className="px-6 pb-5">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                  >
                    <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <p className="text-[11px] text-red-600">{error}</p>
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <p className="text-[11px] text-emerald-700">{success}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-100 border border-slate-200 p-0.5 h-9 mb-4 rounded-lg">
                  <TabsTrigger
                    value="login"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white text-slate-500 text-xs h-7 rounded-md transition-all duration-300"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white text-slate-500 text-xs h-7 rounded-md transition-all duration-300"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                {/* LOGIN TAB */}
                <TabsContent value="login" className="mt-0">
                  <motion.form
                    key="login-form"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleLogin}
                    className="space-y-3"
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor="login-email" className="text-slate-700 text-xs font-medium">Email Address</Label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="name@boldvan.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                          className="pl-9 h-9 text-sm bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password" className="text-slate-700 text-xs font-medium">Password</Label>
                        <Link to="/forgot-password" className="text-[10px] text-teal-600 hover:text-teal-500 transition-colors">
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                        <Input
                          id="login-password"
                          type={showLoginPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                          className="pl-9 pr-9 h-9 text-sm bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showLoginPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-9 text-sm bg-gradient-to-r from-teal-500 to-emerald-600 text-white border-0 hover:shadow-lg hover:shadow-teal-500/20 hover:scale-[1.01] transition-all duration-300"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Signing in...</>
                      ) : (
                        <>Sign In <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></>
                      )}
                    </Button>
                  </motion.form>
                </TabsContent>

                {/* REGISTER TAB */}
                <TabsContent value="register" className="mt-0">
                  <motion.form
                    key="register-form"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleRegister}
                    className="space-y-2.5"
                  >
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <Label htmlFor="firstName" className="text-slate-700 text-xs font-medium">First Name</Label>
                        <div className="relative group">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                          <Input
                            id="firstName"
                            placeholder="Your first name"
                            value={regFirstName}
                            onChange={(e) => setRegFirstName(e.target.value)}
                            className="pl-9 h-9 text-sm bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500/20 transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="lastName" className="text-slate-700 text-xs font-medium">Last Name</Label>
                        <div className="relative group">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                          <Input
                            id="lastName"
                            placeholder="Your last name"
                            value={regLastName}
                            onChange={(e) => setRegLastName(e.target.value)}
                            className="pl-9 h-9 text-sm bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500/20 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="reg-email" className="text-slate-700 text-xs font-medium">Email Address</Label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="email@boldvan.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          required
                          className="pl-9 h-9 text-sm bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="phone" className="text-slate-700 text-xs font-medium">Phone Number</Label>
                      <div className="relative group">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="080 1234 5678"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          className="pl-9 h-9 text-sm bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="reg-password" className="text-slate-700 text-xs font-medium">Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                        <Input
                          id="reg-password"
                          type={showRegPassword ? 'text' : 'password'}
                          placeholder="Create a strong password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          required
                          minLength={8}
                          className="pl-9 pr-9 h-9 text-sm bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showRegPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      <PasswordStrength password={regPassword} />
                    </div>

                    <div className="flex items-start gap-2 pt-0.5">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500/30 focus:ring-offset-0 h-3.5 w-3.5 shrink-0"
                      />
                      <Label htmlFor="terms" className="text-[10px] text-slate-500 leading-relaxed">
                        I agree to the{' '}
                        <Link to="/terms" className="text-teal-600 hover:text-teal-500 underline underline-offset-2">Terms of Service</Link>
                        {' '}&{' '}
                        <Link to="/privacy" className="text-teal-600 hover:text-teal-500 underline underline-offset-2">Privacy Policy</Link>
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-9 text-sm bg-gradient-to-r from-teal-500 to-emerald-600 text-white border-0 hover:shadow-lg hover:shadow-teal-500/20 hover:scale-[1.01] transition-all duration-300"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Creating account...</>
                      ) : (
                        <>Create Account <ShieldCheck className="ml-1.5 h-3.5 w-3.5" /></>
                      )}
                    </Button>
                  </motion.form>
                </TabsContent>
              </Tabs>

              {/* Divider */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 text-[10px] text-slate-400 bg-white">or continue with</span>
                </div>
              </div>

              {/* Google Sign-In Button */}
              <div className="flex justify-center mb-3">
                <GoogleLogin
                  key={activeTab}
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google sign-in failed. Please try again.')}
                  theme="outline"
                  size="large"
                  shape="rectangular"
                  text={activeTab === 'login' ? 'signin_with' : 'signup_with'}
                  width={320}
                />
              </div>

              {/* Guest Option */}
              <Button
                variant="outline"
                className="w-full h-8 text-xs border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all"
                onClick={() => navigate('/')}
              >
                <Home className="mr-1.5 h-3.5 w-3.5" />
                Continue as Guest
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-4 text-[10px] text-slate-400"
        >
          &copy; 2026 BOLDVAN. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
