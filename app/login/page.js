'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Droplets, ArrowRight, Sun, Moon, Globe } from 'lucide-react';

const translations = {
  zh: {
    manager_passcode: "管理员登录密码",
    enter_passcode: "请输入控制台访问密码",
    verify_passcode: "验证密码并登录",
    branding_desc: "独立站群与联盟建站自动化管理系统",
    auth_only: "仅限授权人员操作。登录会话有效期为 7 天。",
    loading_auth: "正在验证密码...",
  },
  en: {
    manager_passcode: "Manager Passcode",
    enter_passcode: "Enter access passcode",
    verify_passcode: "Verify Passcode",
    branding_desc: "Affiliate & Site Builder Control Panel",
    auth_only: "Authorized personnel only. Sessions expire after 7 days.",
    loading_auth: "Verifying passcode...",
  }
};

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState('zh');
  const router = useRouter();

  // Helper translate
  const t = (key) => {
    return translations[lang][key] || key;
  };

  useEffect(() => {
    // Theme initialization (defaulting to light)
    const storedTheme = localStorage.getItem('affsite_theme');
    const initialDark = storedTheme === 'dark';
    setIsDark(initialDark);
    if (initialDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Language initialization (defaulting to Chinese 'zh')
    const storedLang = localStorage.getItem('affsite_lang');
    setLang(storedLang === 'en' ? 'en' : 'zh');
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem('affsite_theme', nextDark ? 'dark' : 'light');
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleLang = () => {
    const nextLang = lang === 'zh' ? 'en' : 'zh';
    setLang(nextLang);
    localStorage.setItem('affsite_lang', nextLang);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(lang === 'zh' ? '验证失败：密码输入错误，请重试。' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4 transition-colors duration-300 relative">
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/5 blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-600/5 blur-3xl -z-10 animate-pulse"></div>

      {/* Top right language and theme switchers */}
      <div className="absolute top-6 right-6 flex items-center gap-2.5">
        <button
          onClick={toggleLang}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-card-border bg-card-bg hover:bg-slate-500/10 text-xs font-semibold text-text-muted hover:text-text-heading transition-colors cursor-pointer"
          title="切换语言 / Toggle Language"
        >
          <Globe className="w-3.5 h-3.5" />
          {lang === 'zh' ? 'EN' : '中文'}
        </button>

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-card-border bg-card-bg hover:bg-slate-500/10 text-text-muted hover:text-text-heading transition-colors cursor-pointer"
          title="切换皮肤 / Toggle Theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-logo-from to-logo-to shadow-lg shadow-blue-500/20 mb-4 animate-bounce">
            <Droplets className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-text-heading to-text-muted bg-clip-text text-transparent">
            {lang === 'zh' ? 'AffSite 管理控制台' : 'AffSite Admin'}
          </h1>
          <p className="text-sm text-text-muted mt-2">
            {t('branding_desc')}
          </p>
        </div>

        {/* Login form card */}
        <div className="bg-card-bg border border-card-border rounded-3xl p-8 shadow-2xl shadow-black/5 dark:shadow-black/50">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                {t('manager_passcode')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="password"
                  placeholder={t('enter_passcode')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-input-bg border border-input-border rounded-2xl focus:border-blue-500 text-text-heading placeholder-slate-400 dark:placeholder-slate-600 outline-none transition-all duration-300"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 rounded-xl text-sm text-center font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-logo-from to-logo-to hover:opacity-90 active:scale-[0.98] text-white font-semibold shadow-lg shadow-blue-600/10 hover:shadow-blue-500/25 disabled:opacity-50 disabled:pointer-events-none transition-all duration-300 cursor-pointer animate-fade-in"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {t('verify_passcode')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-text-muted mt-8">
          {t('auth_only')}
        </p>
      </div>
    </div>
  );
}
