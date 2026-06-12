"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Check, Shield, Award, Sparkles, Terminal, 
  CreditCard, ChevronRight, Minus, Plus, AlertCircle, 
  Download, CheckCircle, Info, RefreshCw, Smartphone, Building, User, Mail
} from "lucide-react";
import confetti from "canvas-confetti";
import Turnstile from "@/components/ui/Turnstile";
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
  
  // Payment result states
  const [registrationId, setRegistrationId] = useState<string>("");
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  // Refs for drawing and downloading the ticket
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ticketRenderedRef = useRef<boolean>(false);

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
      if (promo.targetTierId === selectedTierId) {
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

  // 1. Submit Registration Form and Initiate Order
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

  // 5. Draw Digital Cyber Ticket on HTML5 Canvas
  useEffect(() => {
    if (checkoutStep === "success" && canvasRef.current && paymentDetails) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Gradient background
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, "#080810");
      grad.addColorStop(0.5, "#020205");
      grad.addColorStop(1, "#0a0c16");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid overlay lines
      ctx.strokeStyle = "rgba(0, 82, 255, 0.04)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Border accents (Neon cyan & blue)
      ctx.strokeStyle = "#0052ff";
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

      // Glow corners
      ctx.strokeStyle = "#00f0ff";
      ctx.lineWidth = 6;
      // Top-Left corner
      ctx.beginPath();
      ctx.moveTo(3, 40); ctx.lineTo(3, 3); ctx.lineTo(40, 3);
      ctx.stroke();
      // Bottom-Right corner
      ctx.beginPath();
      ctx.moveTo(canvas.width - 3, canvas.height - 40);
      ctx.lineTo(canvas.width - 3, canvas.height - 3);
      ctx.lineTo(canvas.width - 40, canvas.height - 3);
      ctx.stroke();

      // Divider line for stub ticket (on the right)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(canvas.width - 240, 10);
      ctx.lineTo(canvas.width - 240, canvas.height - 10);
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      // Circular punch-out indicators on the top and bottom of divider
      ctx.fillStyle = "#030303";
      ctx.beginPath();
      ctx.arc(canvas.width - 240, 0, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(canvas.width - 240, canvas.height, 15, 0, Math.PI * 2);
      ctx.fill();

      // Left Panel Content: Brand and Attendee Info
      // Header Text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 26px font-sans, system-ui";
      ctx.fillText("THUNDERCIPHER", 40, 60);

      ctx.fillStyle = "#00f0ff";
      ctx.font = "bold 13px font-mono";
      ctx.fillText("CONFERENCE 2026 // SECURITY SUMMIT", 40, 85);

      // Horizontal subtle accent line
      ctx.fillStyle = "rgba(0, 82, 255, 0.3)";
      ctx.fillRect(40, 105, 300, 2);

      // Registration Details labels
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "10px font-mono";
      ctx.fillText("ATTENDEE NAME", 40, 140);
      ctx.fillText("EMAIL ADDRESS", 40, 195);
      ctx.fillText("ORGANIZATION / COLLEGE", 40, 250);
      ctx.fillText("ACCESS LEVEL", 40, 305);
      ctx.fillText("QUANTITY", 220, 305);

      // Details values
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 15px font-sans";
      ctx.fillText(paymentDetails.name, 40, 162);
      ctx.font = "14px font-mono";
      ctx.fillText(paymentDetails.email, 40, 217);
      ctx.font = "bold 14px font-sans";
      ctx.fillText(paymentDetails.organization, 40, 272);

      // Highlight Box for ticket tier
      ctx.fillStyle = "rgba(0, 240, 255, 0.08)";
      ctx.fillRect(40, 318, 140, 32);
      ctx.strokeStyle = "rgba(0, 240, 255, 0.25)";
      ctx.lineWidth = 1;
      ctx.strokeRect(40, 318, 140, 32);

      ctx.fillStyle = "#00f0ff";
      ctx.font = "bold 11px font-mono";
      ctx.textAlign = "center";
      ctx.fillText(paymentDetails.ticketName.toUpperCase(), 110, 338);
      ctx.textAlign = "left"; // Reset align

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 15px font-mono";
      ctx.fillText(`${paymentDetails.quantity} PASS(ES)`, 220, 338);

      // Right Panel Content: Stub & QR Code
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.font = "9px font-mono";
      ctx.fillText("TICKET SIGNATURE ID", canvas.width - 200, 60);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px font-mono";
      ctx.fillText(registrationId, canvas.width - 200, 80);

      // Programmatic 2D QR Code Drawing
      const qrSize = 100;
      const qrX = canvas.width - 170;
      const qrY = 120;
      
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16);
      ctx.fillStyle = "#000000";
      
      // Draw outer square frames (standards of QR)
      ctx.fillRect(qrX, qrY, 30, 30);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(qrX + 4, qrY + 4, 22, 22);
      ctx.fillStyle = "#000000";
      ctx.fillRect(qrX + 8, qrY + 8, 14, 14);

      // Top right frame
      ctx.fillRect(qrX + qrSize - 30, qrY, 30, 30);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(qrX + qrSize - 26, qrY + 4, 22, 22);
      ctx.fillStyle = "#000000";
      ctx.fillRect(qrX + qrSize - 22, qrY + 8, 14, 14);

      // Bottom left frame
      ctx.fillRect(qrX, qrY + qrSize - 30, 30, 30);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(qrX + 4, qrY + qrSize - 26, 22, 22);
      ctx.fillStyle = "#000000";
      ctx.fillRect(qrX + 8, qrY + qrSize - 22, 14, 14);

      // Pseudo random data matrix blocks
      ctx.fillStyle = "#000000";
      const blocksCount = 18;
      const blockSize = qrSize / blocksCount;
      
      // Seeded random matrix drawer
      let seed = registrationId.charCodeAt(registrationId.length - 1) || 42;
      const rand = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
      };

      for (let r = 0; r < blocksCount; r++) {
        for (let c = 0; c < blocksCount; c++) {
          // Avoid the corner registration markers
          if ((r < 6 && c < 6) || (r < 6 && c >= blocksCount - 6) || (r >= blocksCount - 6 && c < 6)) {
            continue;
          }
          if (rand() > 0.47) {
            ctx.fillRect(qrX + c * blockSize, qrY + r * blockSize, blockSize + 0.5, blockSize + 0.5);
          }
        }
      }

      // Sub-text QR
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "8px font-mono";
      ctx.fillText("SCAN AT THE ENTRANCE", canvas.width - 170, 260);

      // Footer brand markers
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.font = "7px font-mono";
      ctx.fillText("THUNDERCIPHER GATEWAY ENGINE CORE V1.0.2 // SECURE PASSING VALIDATED", 40, canvas.height - 25);

      ticketRenderedRef.current = true;
    }
  }, [checkoutStep, paymentDetails, registrationId]);

  // Download Action
  const handleDownloadTicket = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `ThunderCipher_Pass_${registrationId}.png`;
      a.click();
    }
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
    ticketRenderedRef.current = false;
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
            className="inline-flex items-center space-x-2 text-xs font-mono text-slate-500 hover:text-thunder-cyan transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN_TO_HOME</span>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Secure Your Event Pass
              </h1>
              <p className="text-slate-400 text-sm max-w-xl">
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
                <h3 className="text-sm font-mono tracking-wider text-slate-400 uppercase flex items-center">
                  <Terminal className="w-4 h-4 text-thunder-blue mr-2" />
                  Step 01: Select Access Level
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                            ? "bg-thunder-blue/5 border-thunder-blue/80 shadow-[0_0_20px_rgba(0,82,255,0.15)] text-white"
                            : "bg-[#0a0a0c]/50 border-white/5 text-slate-400 hover:border-white/15"
                        }`}
                      >
                        {/* Discount badge */}
                        <div className="absolute top-3 right-3 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-[8px] font-mono tracking-wider text-slate-300">
                          {discount}% OFF
                        </div>

                        <div className="space-y-3">
                          <span className={`text-[9px] font-mono tracking-widest font-bold ${
                            isSelected ? "text-thunder-cyan" : "text-slate-500"
                          }`}>
                            {tier.badge || "GATEWAY PASS"}
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-white font-sans">{tier.name}</h4>
                            <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {tier.desc}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-white/5 flex items-end justify-between">
                          <div>
                            <span className="text-[10px] text-slate-500 line-through block font-mono">
                              ₹{tier.originalPrice}
                            </span>
                            <span className="text-lg font-bold text-white font-mono leading-none">
                              ₹{tier.price}
                            </span>
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                            isSelected 
                              ? "bg-thunder-blue border-thunder-blue text-white" 
                              : "border-white/20 text-transparent"
                          }`}>
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Attendee details input form */}
              <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <h3 className="text-sm font-mono tracking-wider text-slate-300 uppercase flex items-center">
                    <Terminal className="w-4 h-4 text-thunder-cyan mr-2" />
                    Step 02: Attendee Credentials
                  </h3>
                  <div className="flex items-center space-x-1.5 text-[10px] text-slate-500">
                    <Shield className="w-3.5 h-3.5 text-thunder-blue" />
                    <span>256-BIT TLS ENCRYPTED</span>
                  </div>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-5">
                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-xs text-red-400 flex items-start space-x-2.5">
                      <AlertCircle className="w-4.5 h-4.5 mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center">
                        <User className="w-3.5 h-3.5 mr-1 text-thunder-blue" /> Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jane Doe"
                        className="w-full bg-[#0d0d10] border border-white/5 focus:border-thunder-blue rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none transition-all placeholder:text-slate-700 font-sans focus:ring-1 focus:ring-thunder-blue/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center">
                        <Mail className="w-3.5 h-3.5 mr-1 text-thunder-blue" /> Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jane@domain.com"
                        className="w-full bg-[#0d0d10] border border-white/5 focus:border-thunder-blue rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none transition-all placeholder:text-slate-700 font-sans focus:ring-1 focus:ring-thunder-blue/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center">
                        <Smartphone className="w-3.5 h-3.5 mr-1 text-thunder-blue" /> Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full bg-[#0d0d10] border border-white/5 focus:border-thunder-blue rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none transition-all placeholder:text-slate-700 font-mono focus:ring-1 focus:ring-thunder-blue/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center">
                        <Building className="w-3.5 h-3.5 mr-1 text-thunder-blue" /> Organization / College
                      </label>
                      <input
                        type="text"
                        required
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="Apex University"
                        className="w-full bg-[#0d0d10] border border-white/5 focus:border-thunder-blue rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none transition-all placeholder:text-slate-700 font-sans focus:ring-1 focus:ring-thunder-blue/30"
                      />
                    </div>
                  </div>

                  {/* Quantity selector */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-[#0d0d10]/60">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-white">Passes Quantity</span>
                      <span className="text-[10px] text-slate-500 block">Limit 10 passes per registration session.</span>
                    </div>
                    <div className="flex items-center space-x-3.5">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="w-8 h-8 rounded-lg bg-white/2 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-all"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-6 text-center font-mono font-bold text-sm text-white">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= 10}
                        className="w-8 h-8 rounded-lg bg-white/2 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Promo Code Input */}
                  <div className="p-4 rounded-xl border border-white/5 bg-[#0d0d10]/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white">Promo Code</span>
                        <span className="text-[10px] text-slate-500 block">Enter code to apply a discount.</span>
                      </div>
                      {appliedPromoCode && (
                        <button
                          type="button"
                          onClick={handleRemovePromo}
                          className="text-[10px] text-red-400 hover:text-red-300 font-mono underline cursor-pointer"
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
                        className="flex-1 bg-black/45 border border-white/5 focus:border-thunder-blue rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none transition-all placeholder:text-slate-800 font-mono uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={!!appliedPromoCode}
                        className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold font-mono tracking-wider border border-white/10 transition-all disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
                      >
                        APPLY
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-[10px] text-red-400 font-mono">{promoError}</p>
                    )}
                    {promoSuccess && (
                      <p className="text-[10px] text-emerald-400 font-mono">{promoSuccess}</p>
                    )}
                  </div>

                  {/* Cloudflare Turnstile Verification */}
                  <Turnstile onVerify={handleCaptchaVerify} />



                  {/* Pay button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 py-4 rounded-xl bg-thunder-blue text-white shadow-glow-blue hover:shadow-glow-blue-lg text-xs font-bold font-mono tracking-widest uppercase flex items-center justify-center space-x-2 border border-thunder-blue/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>PROCESSING_PAYMENT_INIT...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>PROCEED_TO_GATEWAY (₹{total.toLocaleString("en-IN")})</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Right/Sidebar Panel: Pricing details invoice & Features list */}
            <div className="lg:col-span-5 space-y-6">
              {/* Checkout details invoice card */}
              <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-thunder-cyan/5 blur-3xl rounded-full pointer-events-none" />

                <h3 className="text-xs font-mono tracking-wider text-slate-400 uppercase">
                  ORDER INVOICE SUMMARY
                </h3>

                <div className="space-y-4">
                  {/* Selected Pass tier */}
                  <div className="p-4 rounded-xl border border-white/5 bg-white/2 flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">{selectedTier.name}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">₹{unitPrice.toLocaleString("en-IN")} each</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-white">
                      x{quantity}
                    </span>
                  </div>

                  {/* Financial breakdown */}
                  <div className="space-y-2.5 text-xs font-mono border-b border-white/5 pb-4">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Passes Subtotal</span>
                      <span>₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center">
                        Convenience Fee ({(CONVENIENCE_FEE_PERCENT * 100)}%)
                        <span title="Gateway integration processing convenience charges.">
                          <Info className="w-3 h-3 ml-1 text-slate-600 cursor-help" />
                        </span>
                      </span>
                      <span>₹{fees.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {/* Grand total */}
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider">
                        Amount Payable
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Includes taxes</span>
                    </div>
                    <span className="text-2xl font-extrabold text-white font-mono">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pass benefits list */}
              <div className="p-6 rounded-2xl border border-white/5 bg-[#0a0a0c]/40 space-y-4">
                <h4 className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase flex items-center">
                  <Award className="w-4 h-4 text-thunder-cyan mr-1.5" />
                  Your Ticket Inclusions
                </h4>
                <ul className="space-y-3">
                  {selectedTier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-thunder-cyan mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
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
              <p className="text-xs text-slate-400 font-mono tracking-widest animate-pulse">
                COMMITTING_TRANSACTION_RECORDS...
              </p>
            </div>
            <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
              Our secure node validator is checking the cryptographic signature payload and syncing your details to the gateway engine database.
            </p>
              </div>
        )}

        {/* 5. Success State and Ticket Download */}
        {checkoutStep === "success" && paymentDetails && (
          <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
            {/* Header success message */}
            <div className="glass-panel rounded-2xl p-6 md:p-8 text-center space-y-4 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-bounce">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-2xl font-extrabold text-white">Payment Verified Successfully!</h2>
                <p className="text-xs text-slate-400 font-sans max-w-md mx-auto">
                  Your registration is confirmed. A notification message has been sent to the secure audit logger. You can inspect your digital entry pass below.
                </p>
              </div>
              {/* Highlight summary badge */}
              <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-xl bg-white/2 border border-white/5 text-xs text-slate-300 font-mono">
                <span>Registration ID:</span>
                <span className="text-thunder-cyan font-bold uppercase">{registrationId}</span>
              </div>
            </div>

            {/* Canvas Ticket Container */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono tracking-wider text-slate-400 uppercase flex items-center">
                  <Terminal className="w-4 h-4 text-thunder-blue mr-2" />
                  Your Cryptographic Entry Ticket
                </h3>
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  PNG FORMAT // 800 x 400 PX
                </span>
              </div>

              {/* HTML5 Canvas (Hidden, used to generate PNG) */}
              <div className="overflow-hidden rounded-xl border border-white/10 shadow-glow-blue max-w-full">
                <canvas 
                  ref={canvasRef} 
                  width={800} 
                  height={400} 
                  className="w-full h-auto block bg-slate-950 font-sans"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={handleDownloadTicket}
                  className="flex-1 py-4 rounded-xl bg-thunder-cyan hover:bg-thunder-cyan-dark text-black font-bold font-mono tracking-widest text-xs uppercase flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all cursor-pointer border border-thunder-cyan/40"
                >
                  <Download className="w-4.5 h-4.5" />
                  <span>Download E-Ticket (PNG)</span>
                </button>
                <button
                  onClick={handleResetForm}
                  className="py-4 px-8 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all text-xs font-bold font-mono tracking-widest uppercase cursor-pointer"
                >
                  Register Another Ticket
                </button>
              </div>
            </div>

            {/* Local Storage Info Alert */}
            <div className="p-4 rounded-xl border border-white/5 bg-[#0a0a0c]/60 space-y-2 text-xs text-slate-400">
              <span className="font-bold text-slate-300 flex items-center">
                <Shield className="w-4 h-4 text-thunder-blue mr-1.5" />
                Data Storage Core Information
              </span>
              <p className="leading-relaxed font-sans">
                Your purchase receipt has been successfully committed to the database store at <code>src/data/registrations.json</code>. The signature ID matches the generated entry QR block and will be validated during physical check-in at the conference venue gate scanner.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
