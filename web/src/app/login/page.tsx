"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { saLogin, saVerifyOtp } from "@/lib/superadmin-api";
import { setToken as setSaToken } from "@/lib/superadmin-auth";
import { adminLogin, adminVerifyOtp } from "@/lib/admin-api";
import { setToken as setAdminToken } from "@/lib/admin-auth";
import { toast } from "sonner";
import { Loader2, Phone, KeyRound, ShieldCheck, ArrowRight, ChevronLeft, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "phone" | "otp";
type Role = "superadmin" | "admin";

export default function UnifiedLoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("superadmin");
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);

  const fullPhone = `+91${phone.trim()}`;
  const canSend = phone.trim().length === 10;
  const canVerify = otp.trim().length === 6;

  const isSA = role === "superadmin";

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;
    setLoading(true);
    try {
      let res;
      if (isSA) {
        res = await saLogin(fullPhone);
      } else {
        res = await adminLogin(fullPhone);
      }
      setDevOtp(res.otp ?? null);
      setStep("otp");
      setTimeout(() => otpInputRef.current?.focus(), 100);
      toast.success("OTP sent successfully");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!canVerify) return;
    setLoading(true);
    try {
      if (isSA) {
        const res = await saVerifyOtp(fullPhone, otp.trim());
        setSaToken(res.token, "Super Admin");
        toast.success("Login successful");
        router.replace("/superadmin/dashboard");
      } else {
        const res = await adminVerifyOtp(fullPhone, otp.trim());
        setAdminToken(res.token, "District Admin");
        toast.success("Login successful");
        router.replace("/admin/dashboard");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  }

  function handleRoleChange(newRole: Role) {
    if (loading) return;
    setRole(newRole);
    setStep("phone");
    setPhone("");
    setOtp("");
    setDevOtp(null);
  }

  const roleConfigs = {
    superadmin: {
      colorMain: "amber-500",
      colorGradientFrom: "from-amber-400",
      colorGradientTo: "to-orange-500",
      iconColor: "text-amber-400",
      bgBlur: "bg-amber-500/10",
      title: "Super Admin Console",
      heading: "Centralized Identity Management",
      desc: "Complete oversight of all hotels, owners, managers, and verification activities across every district.",
      icon: <ShieldCheck className="h-6 w-6 text-white" />
    },
    admin: {
      colorMain: "emerald-500",
      colorGradientFrom: "from-emerald-400",
      colorGradientTo: "to-emerald-600",
      iconColor: "text-emerald-400",
      bgBlur: "bg-emerald-500/10",
      title: "District Admin Console",
      heading: "Regional Identity Management",
      desc: "Complete local oversight of hotels, verifications, and managers within your assigned district jurisdiction.",
      icon: <MapPin className="h-6 w-6 text-white" />
    }
  };

  const config = roleConfigs[role];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden transition-all duration-500">
        {/* Decorative circles */}
        <div className={`absolute -top-20 -right-20 h-96 w-96 rounded-full blur-3xl transition-colors duration-500 ${config.bgBlur}`} />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br shadow-xl transition-all duration-500",
            config.colorGradientFrom, config.colorGradientTo
          )}>
            {config.icon}
          </div>
          <div>
            <p className={cn("text-xs font-bold tracking-widest uppercase transition-colors duration-500", config.iconColor)}>
              Pahchaan ID
            </p>
            <p className="text-sm font-semibold text-white">Government Portal</p>
          </div>
        </div>

        {/* Center copy */}
        <div className="relative">
          <p className={cn("text-xs font-bold tracking-[4px] uppercase mb-4 transition-colors duration-500", config.iconColor)}>
            {config.title}
          </p>
          <h2 className="text-4xl font-black text-white leading-tight mb-4 whitespace-pre-line">
            {config.heading.split(' ').join('\n')}
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs transition-all duration-500">
            {config.desc}
          </p>

          {/* Stats pills */}
          <div className="mt-8 flex flex-wrap gap-3">
            {[
              { label: "ID Verifications", value: "Realtime" },
              { label: "Access Level", value: isSA ? "Supreme" : "Admin" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-sm">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{s.label}</p>
                <p className="text-sm font-bold text-white mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="relative text-xs text-slate-600">
          Ministry of Home Affairs · Government of India
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br transition-all duration-500", config.colorGradientFrom, config.colorGradientTo)}>
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className={cn("text-xs font-bold tracking-widest uppercase transition-colors duration-500", config.iconColor)}>Pahchaan ID</p>
              <p className="text-xs font-semibold text-slate-400">{isSA ? "Super Admin" : "District Admin"}</p>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8 shadow-2xl">
            
            {/* Role Toggle */}
            <div className="flex w-full bg-slate-900/50 p-1 rounded-xl mb-8 border border-white/5">
              <button
                type="button"
                onClick={() => handleRoleChange("superadmin")}
                className={cn(
                  "flex-1 rounded-lg py-2 text-xs font-bold uppercase tracking-wider transition-all",
                  role === "superadmin" ? "bg-white/10 text-white shadow" : "text-slate-500 hover:text-slate-300"
                )}
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange("admin")}
                className={cn(
                  "flex-1 rounded-lg py-2 text-xs font-bold uppercase tracking-wider transition-all",
                  role === "admin" ? "bg-white/10 text-white shadow" : "text-slate-500 hover:text-slate-300"
                )}
              >
                District Admin
              </button>
            </div>

            {/* Back button */}
            {step === "otp" && (
              <button
                onClick={() => { setStep("phone"); setOtp(""); setDevOtp(null); }}
                className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Change number
              </button>
            )}

            <div className="mb-8">
              <div className={cn(
                "inline-flex h-12 w-12 items-center justify-center rounded-2xl mb-4 transition-colors duration-500",
                step === "phone" ? "bg-blue-500/20" : config.bgBlur
              )}>
                {step === "phone"
                  ? <Phone className="h-5.5 w-5.5 text-blue-400" />
                  : <KeyRound className={cn("h-5.5 w-5.5 transition-colors duration-500", config.iconColor)} />
                }
              </div>
              <h3 className="text-2xl font-black text-white">
                {step === "phone" ? "Sign In" : "Verify OTP"}
              </h3>
              <p className="mt-1.5 text-sm text-slate-400">
                {step === "phone"
                  ? "Enter your registered phone number"
                  : `Enter the 6-digit OTP sent to +91 ${phone}`
                }
              </p>
            </div>

            {step === "phone" ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">
                    Mobile Number
                  </label>
                  <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-4 h-12 focus-within:border-blue-500/50 focus-within:bg-white/8 transition-all">
                    <span className="text-slate-400 text-sm font-semibold mr-2">+91</span>
                    <span className="w-px h-4 bg-white/10 mr-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="XXXXX XXXXX"
                      className="flex-1 bg-transparent text-sm font-medium text-white placeholder-slate-600 outline-none"
                      autoFocus
                      inputMode="numeric"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!canSend || loading}
                  className={cn(
                    "group flex w-full items-center justify-center gap-2.5 rounded-xl h-12 text-sm font-bold transition-all duration-500",
                    canSend && !loading
                      ? cn("bg-gradient-to-r text-white shadow-lg hover:scale-[1.01]", config.colorGradientFrom, config.colorGradientTo)
                      : "bg-white/5 text-slate-600 cursor-not-allowed"
                  )}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>Send OTP <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                {/* Dev OTP hint box */}
                {devOtp && (
                  <div className={cn("rounded-xl border px-4 py-3 bg-white/5", isSA ? "border-amber-500/30" : "border-emerald-500/30")}>
                    <p className={cn("text-[10px] font-bold tracking-widest uppercase mb-1", config.iconColor)}>
                      Dev Mode — OTP
                    </p>
                    <p className="text-2xl font-black tracking-[0.3em] text-white">
                      {devOtp}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">
                    6-Digit OTP
                  </label>
                  <input
                    ref={otpInputRef}
                    type="tel"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    inputMode="numeric"
                    className={cn(
                      "w-full rounded-xl border border-white/10 bg-white/5 px-4 h-12 text-center text-2xl font-black text-white tracking-[0.4em] placeholder-slate-700 outline-none focus:bg-white/8 transition-all",
                      isSA ? "focus:border-amber-500/50" : "focus:border-emerald-500/50"
                    )}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!canVerify || loading}
                  className={cn(
                    "group flex w-full items-center justify-center gap-2.5 rounded-xl h-12 text-sm font-bold transition-all duration-500",
                    canVerify && !loading
                      ? cn("bg-gradient-to-r text-white shadow-lg hover:scale-[1.01]", config.colorGradientFrom, config.colorGradientTo)
                      : "bg-white/5 text-slate-600 cursor-not-allowed"
                  )}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>Verify & Login <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>
                  )}
                </button>
              </form>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-slate-600">
            Access restricted to authorized government personnel only
          </p>
        </div>
      </div>
    </div>
  );
}
