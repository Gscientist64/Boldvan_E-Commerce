// frontend/src/pages/LoginPage.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  Sun,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Home,
  Bolt,
} from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register({ email, password, firstName, lastName, phone });
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-navy-950 via-navy-900 to-boldvan-950 px-4 overflow-hidden relative">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-boldvan-500/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-teal-500/20 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
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

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/[0.07] backdrop-blur-xl border-white/10 shadow-2xl">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-lg text-center text-white">
                {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
              </CardTitle>
            </CardHeader>

            <CardContent className="px-5 pb-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 p-0.5 h-9 mb-4">
                  <TabsTrigger
                    value="login"
                    className="data-[state=active]:bg-boldvan-gradient data-[state=active]:text-white text-slate-400 text-xs h-7 transition-all"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="data-[state=active]:bg-boldvan-gradient data-[state=active]:text-white text-slate-400 text-xs h-7 transition-all"
                  >
                    Register
                  </TabsTrigger>
                </TabsList>

                  {/* LOGIN FORM */}
                  <TabsContent value="login" className="mt-0">
                    <motion.form
                      key="login-form"
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleLogin}
                      className="space-y-3"
                    >
                      <div className="space-y-1.5">
                        <Label htmlFor="login-email" className="text-slate-300 text-xs">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="name@boldvan.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="pl-9 h-9 text-sm bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-boldvan-500 focus:ring-boldvan-500/20"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="login-password" className="text-slate-300 text-xs">Password</Label>
                          <Link to="/forgot-password" className="text-[10px] text-teal-400 hover:text-teal-300">
                            Forgot?
                          </Link>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <Input
                            id="login-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="pl-9 pr-9 h-9 text-sm bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-boldvan-500 focus:ring-boldvan-500/20"
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

                      <Button
                        type="submit"
                        className="w-full h-9 text-sm bg-boldvan-gradient text-white border-0 hover:shadow-boldvan hover:scale-[1.01] transition-all"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Signing in...</>
                        ) : (
                          <>Sign In<ArrowRight className="ml-1.5 h-3.5 w-3.5" /></>
                        )}
                      </Button>
                    </motion.form>
                  </TabsContent>

                  {/* REGISTER FORM */}
                  <TabsContent value="register" className="mt-0">
                    <motion.form
                      key="register-form"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleRegister}
                      className="space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="firstName" className="text-slate-300 text-xs">First Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <Input
                              id="firstName"
                              placeholder="Michael"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              className="pl-9 h-9 text-sm bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-boldvan-500 focus:ring-boldvan-500/20"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="lastName" className="text-slate-300 text-xs">Last Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <Input
                              id="lastName"
                              placeholder="Eddison"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              className="pl-9 h-9 text-sm bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-boldvan-500 focus:ring-boldvan-500/20"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="reg-email" className="text-slate-300 text-xs">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <Input
                            id="reg-email"
                            type="email"
                            placeholder="email@boldvan.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="pl-9 h-9 text-sm bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-boldvan-500 focus:ring-boldvan-500/20"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-slate-300 text-xs">Phone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="08012345678"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="pl-9 h-9 text-sm bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-boldvan-500 focus:ring-boldvan-500/20"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="reg-password" className="text-slate-300 text-xs">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <Input
                            id="reg-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Min. 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="pl-9 pr-9 h-9 text-sm bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-boldvan-500 focus:ring-boldvan-500/20"
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

                      <div className="flex items-center space-x-1.5">
                        <input
                          type="checkbox"
                          id="terms"
                          required
                          className="rounded border-white/10 bg-white/5 text-teal-500 focus:ring-teal-500/20 focus:ring-offset-0 h-3.5 w-3.5"
                        />
                        <Label htmlFor="terms" className="text-[10px] text-slate-400 leading-none">
                          I agree to the{' '}
                          <Link to="/terms" className="text-teal-400 hover:text-teal-300">Terms</Link>
                          {' '}&{' '}
                          <Link to="/privacy" className="text-teal-400 hover:text-teal-300">Privacy</Link>
                        </Label>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-9 text-sm bg-boldvan-gradient text-white border-0 hover:shadow-boldvan hover:scale-[1.01] transition-all"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Creating...</>
                        ) : (
                          <>Create Account<ArrowRight className="ml-1.5 h-3.5 w-3.5" /></>
                        )}
                      </Button>
                    </motion.form>
                  </TabsContent>
              </Tabs>

              {/* Divider + Guest */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.08]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-2 text-[10px] text-slate-500 bg-navy-900/60 backdrop-blur-sm">or</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full h-8 text-xs bg-white/[0.03] border-white/10 hover:bg-white/[0.08] text-slate-300 transition-all"
                onClick={() => navigate('/')}
              >
                <Home className="mr-1.5 h-3.5 w-3.5" />
                Continue as Guest
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Compact footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-3 text-[10px] text-slate-600"
        >
          © 2026 BOLDVAN. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoginPage;