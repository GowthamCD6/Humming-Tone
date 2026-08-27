import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { X, User, LogIn, AlertCircle, ShieldCheck } from "lucide-react";
import { API_BASE_URL } from "../../utils/apiConfig";
import "./AuthModal.css";

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setErrorMsg("Google Sign-In failed. No credential received.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("userToken", data.token);
        localStorage.setItem("customerUser", JSON.stringify(data.user));
        window.dispatchEvent(new Event("user:auth_changed"));

        if (onAuthSuccess) {
          onAuthSuccess(data.user);
        }
        onClose();
      } else {
        setErrorMsg(data.error?.message || data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Google Auth error:", err);
      setErrorMsg("Unable to connect to login server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrorMsg("Google Sign-In was cancelled or failed.");
  };

  return (
    <div className="store-auth-modal-overlay" onClick={onClose}>
      <div
        className="store-auth-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          className="store-auth-close-btn"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        <div className="store-auth-header">
          <div className="store-auth-icon-wrap">
            <User size={28} />
          </div>
          <h2 className="store-auth-title">Welcome to Humming Tone</h2>
          <p className="store-auth-subtitle">
            Sign in with Google to track orders, save your wishlist, write verified product reviews, and enjoy 1-click checkout.
          </p>
        </div>

        {errorMsg && (
          <div className="store-auth-error">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="store-auth-google-btn-box">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_blue"
            shape="pill"
            size="large"
            text="continue_with"
            width="320"
          />
        </div>

        <div className="store-auth-footer-note">
          <ShieldCheck size={16} className="secure-badge-icon" />
          <span>Fast, safe & encrypted authentication powered by Google.</span>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
