// frontend/src/pages/ForgotPasswordPage.tsx

import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  ArrowLeft,
  CheckCircle,
  Bolt,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7000/api';

const ForgotPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const resetToken = searchParams.get('token');

  // Forgot password state
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // Reset password state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isResetDone, setIsResetDone] = useState(false);
  const [error, setError] = useState('');

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      await res.json();
      setIsSent(true);
    } catch (err) {
      console.error('Forgot password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsResetLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to reset password');
        return;
      }

      setIsResetDone(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-navy-950 via-navy-900 to-boldvan-950 px-4 overflow-hidden relative">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-boldvan-500/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-teal-500/20 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Compact Brand */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-2 mb-5"
        >
          <div className="p-1.5 rounded-lg bg-boldvan-gradient">
            <Bolt className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">
            BOLD<span className="text-teal-400">VAN</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/[0.07] backdrop-blur-xl border-white/10 shadow-2xl">
            {resetToken ? (
              /* ──── RESET PASSWORD FORM ──── */
              <>
                <CardHeader className="pb-2 pt-4 px-5">
                  <CardTitle className="text-lg text-center text-white">
                    {isResetDone ? 'Password Reset!' : 'Set New Password'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-4">
                  {isResetDone ? (
                    <div className="text-center space-y-4">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-teal-500/20">
                        <CheckCircle className="h-7 w-7 text-teal-400" />
                      </div>
                      <p className="text-slate-300 text-sm">
                        Your password has been reset successfully.
                      </p>
                      <Button
                        className="w-full h-9 text-sm bg-boldvan-gradient text-white"
                        onClick={() => navigate('/login')}
                      >
                        Go to Login
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleResetPassword} className="space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="new-password" className="text-slate-300 text-xs">New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <Input
                            id="new-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Min. 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="pl-9 pr-9 h-9 text-sm bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-boldvan-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                          >
                            {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="confirm-password" className="text-slate-300 text-xs">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <Input
                            id="confirm-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="pl-9 h-9 text-sm bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-boldvan-500"
                          />
                        </div>
                      </div>

                      {error && (
                        <p className="text-red-400 text-xs">{error}</p>
                      )}

                      <Button
                        type="submit"
                        className="w-full h-9 text-sm bg-boldvan-gradient text-white border-0 hover:scale-[1.01] transition-all"
                        disabled={isResetLoading}
                      >
                        {isResetLoading ? (
                          <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Resetting...</>
                        ) : (
                          <>Reset Password<ArrowRight className="ml-1.5 h-3.5 w-3.5" /></>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </>
            ) : (
              /* ──── FORGOT PASSWORD FORM ──── */
              <>
                <CardHeader className="pb-2 pt-4 px-5">
                  <CardTitle className="text-lg text-center text-white">
                    {isSent ? 'Check Your Email' : 'Forgot Password'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-4">
                  {isSent ? (
                    <div className="text-center space-y-4">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-teal-500/20">
                        <Mail className="h-7 w-7 text-teal-400" />
                      </div>
                      <p className="text-slate-300 text-sm">
                        If an account exists for <span className="text-teal-400">{email}</span>, we've sent a password reset link.
                      </p>
                      <p className="text-slate-500 text-xs">
                        Check your spam folder if you don't see it.
                      </p>
                      <Button
                        variant="outline"
                        className="w-full h-8 text-xs bg-white/[0.03] border-white/10 text-slate-300"
                        onClick={() => navigate('/login')}
                      >
                        <ArrowLeft className="mr-1.5 h-3 w-3" />
                        Back to Login
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPassword} className="space-y-3">
                      <p className="text-slate-400 text-xs text-center mb-2">
                        Enter your email and we'll send you a link to reset your password.
                      </p>

                      <div className="space-y-1.5">
                        <Label htmlFor="reset-email" className="text-slate-300 text-xs">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder="name@boldvan.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="pl-9 h-9 text-sm bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-boldvan-500"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-9 text-sm bg-boldvan-gradient text-white border-0 hover:scale-[1.01] transition-all"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Sending...</>
                        ) : (
                          <>Send Reset Link<ArrowRight className="ml-1.5 h-3.5 w-3.5" /></>
                        )}
                      </Button>

                      <div className="text-center pt-1">
                        <Link to="/login" className="text-xs text-slate-400 hover:text-teal-400 transition-colors inline-flex items-center gap-1">
                          <ArrowLeft className="h-3 w-3" />
                          Back to Login
                        </Link>
                      </div>
                    </form>
                  )}
                </CardContent>
              </>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
