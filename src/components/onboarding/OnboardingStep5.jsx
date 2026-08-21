import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Upload, ShieldCheck, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import Button from '../ui/Button';

export default function OnboardingStep5({ data, onChange }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(data.profilePhoto || null);

  // Start Web Camera with flexible fallback constraints
  const startCamera = async () => {
    setCameraError(null);
    let mediaStream = null;

    try {
      // Primary constraint try
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
    } catch (err1) {
      try {
        // Fallback constraint try
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      } catch (err2) {
        console.warn('Camera access denied or unavailable:', err2);
        setCameraError('Web camera access failed. You can upload an image file directly below.');
        setCameraActive(false);
        return;
      }
    }

    if (mediaStream) {
      setStream(mediaStream);
      setCameraActive(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch((pErr) => console.warn('Video play error:', pErr));
        }
      }, 100);
    }
  };

  // Stop Camera stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Capture Snapshot from Video Stream to Canvas
  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(dataUrl);
    onChange('profilePhoto', dataUrl);
    stopCamera();
  };

  // Retake Photo
  const handleRetake = () => {
    setCapturedPhoto(null);
    onChange('profilePhoto', null);
    startCamera();
  };

  // Fallback File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        setCapturedPhoto(result);
        onChange('profilePhoto', result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Step Header */}
      <div>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          Step 5 of 5 • Photo Verification
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mt-2">
          FinLabs Profile Photo & Verification
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Take a live profile photo or upload an avatar to complete your FinLabs security profile.
        </p>
      </div>

      {/* Camera Preview / Captured Photo Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-xl relative overflow-hidden">
        {/* Hidden Canvas for Canvas Snapshot */}
        <canvas ref={canvasRef} className="hidden" />

        {capturedPhoto ? (
          /* Captured Photo Preview State */
          <div className="space-y-4">
            <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-emerald-500 shadow-xl shadow-emerald-500/20">
              <img
                src={capturedPhoto}
                alt="FinLabs Profile Snapshot"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4" /> Photo Captured & Verified
              </span>
              <p className="text-xs text-slate-400">Your profile photo is linked with your FinLabs dashboard</p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                onClick={handleRetake}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Retake Photo / Change Image
              </Button>
            </div>
          </div>
        ) : cameraActive ? (
          /* Live Video Stream State */
          <div className="space-y-4">
            <div className="relative max-w-sm mx-auto rounded-2xl overflow-hidden border-2 border-emerald-500/50 bg-black aspect-video flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={() => videoRef.current?.play()}
                className="w-full h-full object-cover"
              />
              {/* Overlay Frame Guide */}
              <div className="absolute inset-4 border-2 border-dashed border-emerald-400/50 rounded-xl pointer-events-none flex items-center justify-center">
                <span className="text-[10px] uppercase font-bold text-emerald-400/80 bg-black/60 px-2 py-0.5 rounded-full">
                  Position face in frame
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                icon={Camera}
                onClick={captureSnapshot}
                className="bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 px-6"
              >
                Capture Photo
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={stopCamera}
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          /* Initial Standby / Start Camera State */
          <div className="py-8 space-y-5">
            <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <Camera className="w-10 h-10" />
            </div>

            <div className="max-w-xs mx-auto space-y-1">
              <h4 className="text-sm font-bold text-white">Capture Profile Snapshot</h4>
              <p className="text-xs text-slate-400">
                Click below to start your web camera or upload an image file.
              </p>
            </div>

            {cameraError && (
              <div className="max-w-md mx-auto p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{cameraError}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                icon={Camera}
                onClick={startCamera}
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/25"
              >
                Start Camera & Take Photo
              </Button>

              <label className="w-full sm:w-auto cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <span className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 transition w-full shadow-sm">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  Upload Photo File
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Security & Verification Banner */}
      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Photo verification links your snapshot with your FinLabs profile avatar & financial blueprint diagnostic.
        </p>
      </div>
    </div>
  );
}
