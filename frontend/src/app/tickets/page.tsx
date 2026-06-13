"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  ArrowLeft02Icon, TerminalIcon, Checkmark, InformationCircleIcon, 
  AlertCircleIcon, Remove01Icon, Add01Icon, Award01Icon, 
  Shield01Icon, SparklesIcon, Cancel01Icon 
} from "@hugeicons/core-free-icons";
import confetti from "canvas-confetti";
import CyberCaptcha from "@/components/ui/CyberCaptcha";
import { TICKET_TIERS, CONVENIENCE_FEE_PERCENT, calculateTotal, VALID_PROMO_CODES } from "@/lib/tickets";

export default function TicketsPage() {
  // Navigation / Flow state
  const [selectedTierId, setSelectedTierId] = useState<string>("student"); // Defaults to student for easier offer testing
  const [quantity, setQuantity] = useState<number>(1);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [organization, setOrganization] = useState<string>("");
  
  // Promo code states
  const [promoCodeInput, setPromoCodeInput] = useState<string>("");
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  // Security / Verification state
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const [captchaVerified, setCaptchaVerified] = useState<boolean>(false);
  
  // Form submission and UI states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"form" | "processing" | "success">("form");
  
  // Guidelines popup state
  const [showGuidelines, setShowGuidelines] = useState<boolean>(false);

  // Payment result states
  const [registrationId, setRegistrationId] = useState<string>("");
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  // Fallback check: remove applied promo code if selected tier changes to prevent invalid applications
  useEffect(() => {
    handleRemovePromo();
  }, [selectedTierId]);

  // Recalculate totals on tier, quantity, or promo changes
  const selectedTier = TICKET_TIERS[selectedTierId];
  const { subtotal, fees, total, unitPrice, isPromoApplied } = calculateTotal(
    selectedTierId, 
    quantity, 
    appliedPromoCode || undefined
  ) || { subtotal: 0, fees: 0, total: 0, unitPrice: selectedTier.price, isPromoApplied: false };

  const handleCaptchaVerify = (verified: boolean, token: string) => {
    setCaptchaVerified(verified);
    setCaptchaToken(token);
  };

  const handleQuantityChange = (val: number) => {
    const newQty = quantity + val;
    if (newQty >= 1 && newQty <= 10) {
      setQuantity(newQty);
    }
  };

  // Promo actions
  const handleApplyPromo = (e: React.MouseEvent) => {
    e.preventDefault();
    setPromoError(null);
    setPromoSuccess(null);

    const formattedCode = promoCodeInput.trim().toUpperCase();
    if (!formattedCode) {
      setPromoError("Please enter a promo code.");
      return;
    }

    const promo = VALID_PROMO_CODES[formattedCode];
    if (promo) {
      if (promo.targetTierId === selectedTierId || promo.targetTierId === "*") {
        setAppliedPromoCode(formattedCode);
        setPromoSuccess(`Code applied successfully! Price reduced to ₹${promo.discountPrice}.`);
      } else {
        const targetTierName = TICKET_TIERS[promo.targetTierId]?.name || promo.targetTierId;
        setPromoError(`This promo code is only valid for the ${targetTierName}.`);
        setAppliedPromoCode(null);
      }
    } else {
      setPromoError("Invalid promo code.");
      setAppliedPromoCode(null);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromoCode(null);
    setPromoCodeInput("");
    setPromoSuccess(null);
    setPromoError(null);
  };

  // Safe Razorpay JS script injection helper
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  // 1. Validate form and show guidelines popup
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form validations
    if (!name.trim() || name.trim().length < 3) {
      setError("Please enter your full name (minimum 3 characters).");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!organization.trim()) {
      setError("Please specify your Organization or College name.");
      return;
    }
    if (!captchaVerified) {
      setError("Please complete the drag verification check.");
      return;
    }

    // Show guidelines popup instead of directly proceeding
    setShowGuidelines(true);
  };

  // 1b. Actually proceed to payment after user acknowledges guidelines
  const handleConfirmAndPay = async () => {
    setShowGuidelines(false);
    setLoading(true);

    try {
      // Create the gateway order
      const response = await fetch("/api/tickets/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          organization,
          ticketType: selectedTierId,
          quantity,
          captchaToken,
          promoCode: appliedPromoCode || undefined
        }),
      });

      const orderData = await response.json();

      if (!response.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to initialize order details.");
      }

      // Trigger live Razorpay checkout popup
      await launchRazorpayCheckout(orderData);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during order initialization.");
      setLoading(false);
    }
  };

  // 2. Launch Razorpay Gateway popup
  const launchRazorpayCheckout = async (orderData: any) => {
    setLoading(true);
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !(window as any).Razorpay) {
      setError("Razorpay checkout engine failed to load. Please check your network and try again.");
      setLoading(false);
      return;
    }

    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "ThunderCipher 2026",
      description: `${selectedTier.name} x ${quantity}`,
      order_id: orderData.orderId,
      handler: async function (response: any) {
        setLoading(true);
        setCheckoutStep("processing");
        try {
          const verifyRes = await fetch("/api/tickets/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              email,
              phone,
              organization,
              ticketType: selectedTierId,
              quantity,
              orderId: orderData.orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              isMock: false,
              promoCode: appliedPromoCode || undefined
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            handleSuccess(verifyData.registrationId, verifyData.record);
          } else {
            throw new Error(verifyData.error || "Payment signature verification failed.");
          }
        } catch (err: any) {
          setError(err.message || "Failed to verify transaction signature.");
          setCheckoutStep("form");
          setLoading(false);
        }
      },
      prefill: {
        name,
        email,
        contact: phone,
      },
      notes: {
        organization,
      },
      theme: {
        color: "#0052ff",
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };


  // 4. Successful Payment Completion
  const handleSuccess = (regId: string, record: any) => {
    setRegistrationId(regId);
    setPaymentDetails(record);
    setCheckoutStep("success");
    setLoading(false);

    // Burst particles
    confetti({
      particleCount: 150,
      spread: 85,
      origin: { y: 0.6 },
      colors: ["#0052ff", "#00f0ff", "#ffffff", "#10b981"],
    });
  };

  const handleResetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setOrganization("");
    setCaptchaVerified(false);
    setCaptchaToken("");
    setQuantity(1);
    handleRemovePromo();
    setCheckoutStep("form");
  };

  return (
    <main className="min-h-screen pt-28 pb-24 px-4 sm:px-6 md:px-8 bg-[#030303] relative text-slate-200 overflow-x-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-thunder-blue/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[250px] bg-thunder-cyan/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="noise-bg" />

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Navigation & Header */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-sm font-mono text-slate-200 hover:text-thunder-cyan transition-colors"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} className="w-4 h-4" />
            <span>RETURN TO HOME</span>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Secure Your Event Pass
              </h1>
              <p className="text-slate-200 text-sm max-w-xl">
                Register for ThunderCipher Conference 2026. Complete the checkout form below to receive your cryptographic ticket entry pass.
              </p>
            </div>
          </div>
          <div className="w-16 h-1 bg-thunder-blue rounded-full" />
        </div>

        {checkoutStep === "form" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left/Main Content: Pass Selection & Registration Details Form */}
            <div className="lg:col-span-7 space-y-8">
              {/* Ticket Tier Cards selection */}
              <div className="space-y-4">
                <h3 className="text-base font-bold font-mono tracking-wider text-slate-200 uppercase flex items-center">
                  <HugeiconsIcon icon={TerminalIcon} className="w-4.5 h-4.5 text-thunder-blue mr-2" />
                  Step 01: Select Access Level
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.values(TICKET_TIERS).map((tier) => {
                    const isSelected = selectedTierId === tier.id;
                    const discount = Math.round(((tier.originalPrice - tier.price) / tier.originalPrice) * 100);
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setSelectedTierId(tier.id)}
                        className={`text-left relative rounded-xl border p-5 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                          isSelected
                            ? "bg-thunder-blue/10 border-thunder-blue shadow-[0_0_20px_rgba(0,82,255,0.2)] text-white"
                            : "bg-[#0d0d12] border-white/10 text-slate-200 hover:border-white/25"
                        }`}
                      >
                        {/* Discount badge */}
                        <div className="absolute top-3 right-3 bg-white/10 border border-white/25 px-2.5 py-1 rounded-full text-xs font-mono tracking-wider text-white">
                          {discount}% OFF
                        </div>

                        <div className="space-y-3">
                          <span className={`text-xs font-mono tracking-widest font-bold uppercase ${
                            isSelected ? "text-thunder-cyan" : "text-slate-200"
                          }`}>
                            {tier.badge || "GATEWAY PASS"}
                          </span>
                          <div>
                            <h4 className="text-lg font-bold text-white font-sans">{tier.name}</h4>
                            <p className="text-sm text-slate-200 mt-1.5 line-clamp-3 leading-relaxed">
                              {tier.desc}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-white/10 flex items-end justify-between">
                          <div>
                            <span className="text-sm text-slate-300 line-through block font-mono font-bold">
                              ₹{tier.originalPrice}
                            </span>
                            <span className="text-2xl font-bold text-white font-mono leading-none block mt-0.5">
                              ₹{tier.price}
                            </span>
                          </div>
                          <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                            isSelected 
                              ? "bg-thunder-blue border-thunder-blue text-white" 
                              : "border-white/30 text-transparent"
                          }`}>
                            <HugeiconsIcon icon={Checkmark} className="w-4 h-4" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Order Invoice Summary (Only visible on mobile/tablet) */}
              <div className="block lg:hidden glass-panel rounded-2xl p-6 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-thunder-cyan/5 blur-3xl rounded-full pointer-events-none" />

                <h3 className="text-sm font-mono tracking-wider text-slate-200 uppercase font-bold">
                  ORDER INVOICE SUMMARY
                </h3>

                <div className="space-y-4">
                  {/* Selected Pass tier */}
                  <div className="p-4 rounded-xl border border-white/5 bg-white/2 flex items-start justify-between">
                    <div>
                      <span className="text-sm font-bold text-white block">{selectedTier.name}</span>
                      <span className="text-xs text-slate-200 block mt-1">₹{unitPrice.toLocaleString("en-IN")} each</span>
                    </div>
                    <span className="font-mono text-sm font-bold text-white">
                      x{quantity}
                    </span>
                  </div>

                  {/* Financial breakdown */}
                  <div className="space-y-2.5 text-sm font-mono border-b border-white/5 pb-4">
                    <div className="flex items-center justify-between text-slate-200 font-medium">
                      <span>Passes Subtotal</span>
                      <span>₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-200 font-medium">
                      <span className="flex items-center">
                        Convenience Fee ({(CONVENIENCE_FEE_PERCENT * 100)}%)
                        <span title="Gateway integration processing convenience charges.">
                          <HugeiconsIcon icon={InformationCircleIcon} className="w-3.5 h-3.5 ml-1 text-slate-400 cursor-help" />
                        </span>
                      </span>
                      <span>₹{fees.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {/* Grand total */}
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-xs font-mono text-slate-300 block uppercase tracking-wider font-bold">
                        Amount Payable
                      </span>
                      <span className="text-sm text-slate-300 font-mono">Includes taxes</span>
                    </div>
                    <span className="text-3xl font-extrabold text-white font-mono">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Attendee details input form */}
              <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <h3 className="text-base font-bold font-mono tracking-wider text-slate-200 uppercase">
                    Step 02: Attendee Credentials
                  </h3>
                  <div className="flex items-center space-x-1.5 text-sm text-slate-200 font-bold">
                    <span>256-BIT TLS ENCRYPTED</span>
                  </div>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-5">
                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400 flex items-start space-x-2.5">
                      <HugeiconsIcon icon={AlertCircleIcon} className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jane Doe"
                        className="w-full bg-[#0d0d12] border border-white/25 focus:border-thunder-blue rounded-xl px-4 py-3.5 text-base text-white focus:outline-none transition-all placeholder:text-slate-400 font-sans focus:ring-1 focus:ring-thunder-blue/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jane@domain.com"
                        className="w-full bg-[#0d0d12] border border-white/25 focus:border-thunder-blue rounded-xl px-4 py-3.5 text-base text-white focus:outline-none transition-all placeholder:text-slate-400 font-sans focus:ring-1 focus:ring-thunder-blue/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full bg-[#0d0d12] border border-white/25 focus:border-thunder-blue rounded-xl px-4 py-3.5 text-base text-white focus:outline-none transition-all placeholder:text-slate-400 font-mono focus:ring-1 focus:ring-thunder-blue/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                        Organization / College
                      </label>
                      <input
                        type="text"
                        required
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="Apex University"
                        className="w-full bg-[#0d0d12] border border-white/25 focus:border-thunder-blue rounded-xl px-4 py-3.5 text-base text-white focus:outline-none transition-all placeholder:text-slate-400 font-sans focus:ring-1 focus:ring-thunder-blue/30"
                      />
                    </div>
                  </div>

                  {/* Quantity selector */}
                  <div className="flex items-center justify-between p-5 rounded-xl border border-white/15 bg-[#0d0d12]/80">
                    <div className="space-y-1">
                      <span className="text-base font-bold text-white block">Passes Quantity</span>
                      <span className="text-sm text-slate-200 block">Limit 10 passes per registration session.</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-200 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                      >
                        <HugeiconsIcon icon={Remove01Icon} className="w-4.5 h-4.5" />
                      </button>
                      <span className="w-8 text-center font-mono font-bold text-lg text-white">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= 10}
                        className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-200 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                      >
                        <HugeiconsIcon icon={Add01Icon} className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>

                  {/* Promo Code Input */}
                  <div className="p-5 rounded-xl border border-white/15 bg-[#0d0d12]/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-base font-bold text-white block">Promo Code</span>
                        <span className="text-sm text-slate-200 block">Enter code to apply a discount.</span>
                      </div>
                      {appliedPromoCode && (
                        <button
                          type="button"
                          onClick={handleRemovePromo}
                          className="text-sm text-red-400 hover:text-red-300 font-mono font-bold underline cursor-pointer"
                        >
                          REMOVE
                        </button>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        disabled={!!appliedPromoCode}
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value)}
                        placeholder="ENTER CODE"
                        className="flex-1 bg-[#0f0f12] border border-white/25 focus:border-thunder-blue rounded-xl px-4 py-3 text-base text-white focus:outline-none transition-all placeholder:text-slate-400 font-mono uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={!!appliedPromoCode}
                        className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-bold font-mono tracking-wider border border-white/20 transition-all disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer text-white"
                      >
                        APPLY
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-sm text-red-400 font-mono font-bold">{promoError}</p>
                    )}
                    {promoSuccess && (
                      <p className="text-sm text-emerald-400 font-mono font-bold">{promoSuccess}</p>
                    )}
                  </div>

                  {/* CyberCaptcha verification */}
                  <CyberCaptcha onVerify={handleCaptchaVerify} />

                  {/* Pay button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 py-4 rounded-xl bg-thunder-blue text-white shadow-glow-blue hover:shadow-glow-blue-lg text-sm font-bold font-mono tracking-widest uppercase flex items-center justify-center border border-thunder-blue/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? "Processing..." : "Proceed to Pay"}
                  </button>
                </form>
              </div>
            </div>

            {/* Right/Sidebar Panel: Pricing details invoice & Features list */}
            <div className="lg:col-span-5 space-y-6">
              {/* Checkout details invoice card */}
              <div className="hidden lg:block glass-panel rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-thunder-cyan/5 blur-3xl rounded-full pointer-events-none" />

                <h3 className="text-sm font-mono tracking-wider text-slate-200 uppercase font-bold">
                  ORDER INVOICE SUMMARY
                </h3>

                <div className="space-y-4">
                  {/* Selected Pass tier */}
                  <div className="p-4 rounded-xl border border-white/5 bg-white/2 flex items-start justify-between">
                    <div>
                      <span className="text-sm font-bold text-white block">{selectedTier.name}</span>
                      <span className="text-xs text-slate-200 block mt-1">₹{unitPrice.toLocaleString("en-IN")} each</span>
                    </div>
                    <span className="font-mono text-sm font-bold text-white">
                      x{quantity}
                    </span>
                  </div>

                  {/* Financial breakdown */}
                  <div className="space-y-2.5 text-sm font-mono border-b border-white/5 pb-4">
                    <div className="flex items-center justify-between text-slate-200 font-medium">
                      <span>Passes Subtotal</span>
                      <span>₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-200 font-medium">
                      <span className="flex items-center">
                        Convenience Fee ({(CONVENIENCE_FEE_PERCENT * 100)}%)
                        <span title="Gateway integration processing convenience charges.">
                          <HugeiconsIcon icon={InformationCircleIcon} className="w-3.5 h-3.5 ml-1 text-slate-400 cursor-help" />
                        </span>
                      </span>
                      <span>₹{fees.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {/* Grand total */}
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-xs font-mono text-slate-300 block uppercase tracking-wider font-bold">
                        Amount Payable
                      </span>
                      <span className="text-sm text-slate-300 font-mono">Includes taxes</span>
                    </div>
                    <span className="text-3xl font-extrabold text-white font-mono">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pass benefits list */}
              <div className="p-6 rounded-2xl border border-white/5 bg-[#0a0a0c]/40 space-y-4">
                <h4 className="text-sm font-bold font-mono tracking-wider text-slate-200 uppercase flex items-center">
                  <HugeiconsIcon icon={Award01Icon} className="w-4.5 h-4.5 text-thunder-cyan mr-1.5" />
                  Your Ticket Inclusions
                </h4>
                <ul className="space-y-3">
                  {selectedTier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5 text-sm text-slate-200">
                      <HugeiconsIcon icon={Checkmark} className="w-4 h-4 text-thunder-cyan mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Guidelines & Terms */}
              <div className="p-6 rounded-2xl border border-white/5 bg-[#0a0a0c]/40 space-y-4">
                <h4 className="text-sm font-bold font-mono tracking-wider text-slate-200 uppercase flex items-center">
                  <HugeiconsIcon icon={Shield01Icon} className="w-4.5 h-4.5 text-thunder-blue mr-1.5" />
                  Important Guidelines
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-2.5 text-sm text-slate-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-thunder-blue mt-2 flex-shrink-0" />
                    <span>All tickets are strictly <strong>non-refundable</strong>. However, passes can be transferred to another eligible delegate.</span>
                  </li>
                  {selectedTierId === "student" && (
                    <li className="flex items-start space-x-2.5 text-sm text-amber-400 border border-amber-500/25 bg-amber-500/5 p-3 rounded-lg">
                      <HugeiconsIcon icon={AlertCircleIcon} className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Student Verification:</strong> Student Pass holders must carry a valid physical student college ID card. If not found or invalid at the check-in desk, you will have to upgrade to a Standard Pass by paying the ticket price difference.
                      </span>
                    </li>
                  )}
                  <li className="flex items-start space-x-2.5 text-sm text-slate-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-thunder-blue mt-2 flex-shrink-0" />
                    <span>Please ensure your registered email is active, as your secure digital entry pass will be dispatched to this address.</span>
                  </li>
                  <li className="flex items-start space-x-2.5 text-sm text-slate-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-thunder-blue mt-2 flex-shrink-0" />
                    <span>Organizers reserve the right to verify credentials and deny entry in case of falsified information or security violations.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 3. Processing State */}
        {checkoutStep === "processing" && (
          <div className="max-w-md mx-auto glass-panel rounded-2xl p-10 flex flex-col items-center justify-center text-center space-y-6 shadow-glow-blue border-thunder-blue/30 py-16">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-thunder-blue/20 border-t-thunder-cyan animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-thunder-cyan/20 border-b-thunder-blue animate-spin" style={{ animationDirection: 'reverse' }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Verifying Transaction Signature</h3>
              <p className="text-sm text-slate-200 font-mono tracking-widest animate-pulse">
                COMMITTING_TRANSACTION_RECORDS...
              </p>
            </div>
            <p className="text-sm text-slate-300 max-w-xs leading-relaxed">
              Our secure node validator is checking the cryptographic signature payload and syncing your details to the gateway engine database.
            </p>
              </div>
        )}

        {/* 5. Success State */}
        {checkoutStep === "success" && paymentDetails && (
          <div className="max-w-xl mx-auto space-y-6 animate-fadeIn">
            {/* Header success message */}
            <div className="glass-panel rounded-2xl p-8 md:p-10 text-center space-y-5 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-bounce">
                <HugeiconsIcon icon={SparklesIcon} className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-white">Payment Verified Successfully!</h2>
                <p className="text-sm text-slate-200 font-sans max-w-md mx-auto leading-relaxed">
                  Your registration for <strong className="text-white">{paymentDetails.ticketName}</strong> ({paymentDetails.quantity} pass{paymentDetails.quantity > 1 ? "es" : ""}) has been confirmed.
                </p>
              </div>

              {/* Registration ID badge */}
              <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-xl bg-white/2 border border-white/5 text-sm text-slate-200 font-mono">
                <span>Registration ID:</span>
                <span className="text-thunder-cyan font-bold uppercase">{registrationId}</span>
              </div>

              {/* Ticket delivery notice */}
              <div className="p-4 rounded-xl bg-thunder-blue/5 border border-thunder-blue/20 text-sm text-slate-200 space-y-2">
                <p className="font-bold text-white flex items-center justify-center space-x-2">
                  <HugeiconsIcon icon={InformationCircleIcon} className="w-4.5 h-4.5 text-thunder-cyan" />
                  <span>Ticket Delivery Information</span>
                </p>
                <p className="leading-relaxed">
                  Your ticket will be delivered to <strong className="text-white">{paymentDetails.email}</strong> within <strong className="text-thunder-cyan">4 working days</strong> of payment. Please keep your Registration ID safe for reference.
                </p>
              </div>

              {/* Amount paid summary */}
              <div className="flex items-center justify-center space-x-4 text-sm font-mono text-slate-300 pt-2">
                <span>Amount Paid: <strong className="text-white">₹{paymentDetails.totalAmount?.toLocaleString("en-IN")}</strong></span>
              </div>
            </div>

            {/* Action button */}
            <div className="text-center">
              <button
                onClick={handleResetForm}
                className="py-4 px-10 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-slate-200 hover:text-white transition-all text-sm font-bold font-mono tracking-widest uppercase cursor-pointer"
              >
                Register Another Ticket
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Guidelines Popup Modal */}
      {showGuidelines && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowGuidelines(false)}
          />
          
          {/* Modal content */}
          <div className="relative w-full max-w-lg bg-[#0a0a0c] border border-white/10 rounded-2xl p-6 md:p-8 space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto z-10">
            {/* Close button */}
            <button
              onClick={() => setShowGuidelines(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <HugeiconsIcon icon={Shield01Icon} className="w-5 h-5 text-thunder-blue" />
                <h3 className="text-lg font-bold text-white">Important Guidelines</h3>
              </div>
              <p className="text-xs text-slate-300 font-mono">Please read the following before proceeding with your payment.</p>
            </div>

            {/* Guidelines list */}
            <div className="space-y-3">
              <div className="flex items-start space-x-2.5 text-sm text-slate-200">
                <div className="w-1.5 h-1.5 rounded-full bg-thunder-blue mt-2 flex-shrink-0" />
                <span>All tickets are strictly <strong className="text-white">non-refundable</strong>. However, passes can be transferred to another eligible delegate.</span>
              </div>

              {selectedTierId === "student" && (
                <div className="flex items-start space-x-2.5 text-sm text-amber-400 border border-amber-500/25 bg-amber-500/5 p-3 rounded-lg">
                  <HugeiconsIcon icon={AlertCircleIcon} className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Student Verification:</strong> Student Pass holders must carry a valid physical student college ID card. If not found or invalid at the check-in desk, you will have to upgrade to a Standard Pass by paying the ticket price difference.
                  </span>
                </div>
              )}

              {selectedTierId === "woman_in_cyber" && (
                <div className="flex items-start space-x-2.5 text-sm text-purple-400 border border-purple-500/25 bg-purple-500/5 p-3 rounded-lg">
                  <HugeiconsIcon icon={AlertCircleIcon} className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Diversity Pass Verification:</strong> This pass is exclusively for women delegates. Valid government-issued photo ID verification will be required at check-in.
                  </span>
                </div>
              )}

              <div className="flex items-start space-x-2.5 text-sm text-slate-200">
                <div className="w-1.5 h-1.5 rounded-full bg-thunder-blue mt-2 flex-shrink-0" />
                <span>Please ensure your registered email is active, as your digital entry pass will be dispatched to this address.</span>
              </div>

              <div className="flex items-start space-x-2.5 text-sm text-slate-200">
                <div className="w-1.5 h-1.5 rounded-full bg-thunder-blue mt-2 flex-shrink-0" />
                <span>Organizers reserve the right to verify credentials and deny entry in case of falsified information.</span>
              </div>

              {/* Delivery notice */}
              <div className="p-3 rounded-lg bg-thunder-cyan/5 border border-thunder-cyan/20 text-sm text-slate-200">
                <p className="flex items-center space-x-2 font-bold text-white">
                  <HugeiconsIcon icon={InformationCircleIcon} className="w-4 h-4 text-thunder-cyan" />
                  <span>Ticket Delivery</span>
                </p>
                <p className="mt-1 leading-relaxed">
                  Your ticket will be delivered to your registered email within <strong className="text-thunder-cyan">4 working days</strong> of successful payment.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleConfirmAndPay}
                className="flex-1 py-3.5 rounded-xl bg-thunder-blue text-white shadow-glow-blue text-sm font-bold font-mono tracking-widest uppercase transition-all cursor-pointer border border-thunder-blue/40 hover:shadow-glow-blue-lg"
              >
                I Agree, Proceed to Pay
              </button>
              <button
                onClick={() => setShowGuidelines(false)}
                className="py-3.5 px-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-slate-200 hover:text-white transition-all text-sm font-bold font-mono tracking-widest uppercase cursor-pointer"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
