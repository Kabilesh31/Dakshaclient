import React, { useState } from "react";
import Head from "../../layout/head/Head";
import { Button, Icon } from "../../components/Component";
import { Spinner } from "reactstrap";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { errorToast, successToast } from "../../utils/toaster";
import "./Login.css";
import LogoImg from "../../images/logo1.png";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [passState, setPassState] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onFormSubmit = async () => {
    if (!email || !password) {
      errorToast("Email and Password are required");
      return;
    }
    setLoading(true);
    const loginUser = { email, password };
    const postUser = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(loginUser),
    };

    try {
      const response = await fetch(process.env.REACT_APP_BACKENDURL + "/api/user/login", postUser);
      const resData = await response.json();
      const token = resData.token;
      const sessionToken = resData.sessionToken;

      if (!response.ok) {
        setLoading(false);
        errorToast(resData.message || "Invalid email or password");
      } else {
        successToast("Success");
        localStorage.setItem("accessToken", token);
        localStorage.setItem("sessionToken", sessionToken);
        setTimeout(() => {
          window.history.pushState(
            `${process.env.PUBLIC_URL ? process.env.PUBLIC_URL : "/"}`,
            "auth-login",
            `${process.env.PUBLIC_URL ? process.env.PUBLIC_URL : "/"}`
          );
          window.location.reload();
        }, 2000);
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
      errorToast("Network error. Please try again.");
    }
  };

  const { errors, register, handleSubmit } = useForm();

  return (
    <div className="modern-login-container">
      <Head title="Login | Sree Daksha" />

      {/* Animated Gradient Background */}
      <div className="modern-bg">
        <div className="bg-gradient"></div>
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="bg-orb bg-orb-3"></div>
      </div>

      <div className="login-grid">
        {/* FORM PANEL - NOW ON LEFT */}
        <div className="form-panel">
          <div className="form-card-glass">
            <div className="form-header-modern">
              <h2>Welcome back</h2>
              <p>Sign in to access your Business dashboard</p>
            </div>

            <form onSubmit={handleSubmit(onFormSubmit)} className="modern-form">
              {/* Email Field */}
              <div className="input-group-modern">
                <label className="input-label-modern">
                  <Icon name="mail" className="label-icon" />
                  Email address
                </label>
                <div className="input-wrapper-modern">
                  <Icon name="user" className="input-left-icon" />
                  <input
                    type="email"
                    className={`modern-input ${errors.email ? "error" : ""}`}
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    ref={register({
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <div className="error-message-modern">
                    <Icon name="alert-circle" size="sm" />
                    <span>{errors.email.message}</span>
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="input-group-modern">
                <div className="label-row">
                  <label className="input-label-modern">
                    <Icon name="lock" className="label-icon" />
                    Password
                  </label>
                  <Link to={`${process.env.PUBLIC_URL}/auth-reset`} className="forgot-link-modern">
                    Forgot password?
                  </Link>
                </div>
                <div className="input-wrapper-modern">
                  <Icon name="key" className="input-left-icon" />
                  <input
                    type={passState ? "text" : "password"}
                    className={`modern-input ${errors.password ? "error" : ""}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    ref={register({
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Minimum 6 characters required",
                      },
                    })}
                  />
                  <button
                    type="button"
                    className="password-toggle-modern"
                    onClick={() => setPassState(!passState)}
                  >
                    <Icon name={passState ? "eye-off" : "eye"} />
                  </button>
                </div>
                {errors.password && (
                  <div className="error-message-modern">
                    <Icon name="alert-circle" size="sm" />
                    <span>{errors.password.message}</span>
                  </div>
                )}
              </div>

              <button type="submit" className="submit-button-modern" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Icon name="log-in" className="mr-2" />
                    Sign in
                  </>
                )}
              </button>
            </form>

            <div className="form-footer-modern">
              <p>© {new Date().getFullYear()} Sree Daksha. All rights reserved.</p>
              <div className="footer-links">
                <Link to="/privacy">Privacy</Link>
                <span className="footer-divider">•</span>
                <Link to="/terms">Terms</Link>
              </div>
            </div>
          </div>
        </div>

        {/* HERO PANEL - NOW ON RIGHT */}
        <div className="hero-panel">
          <div className="hero-content-inner">
            <div className="hero-brand">
             
              <img src={LogoImg} alt="Sree Daksha" className="brand-logo-img" />
            </div>

           <h1 className="hero-title" style={{ marginTop: "-100px" }}>
  Complete control over your{" "}
  staff and progress
</h1>
            {/* <p className="hero-subtitle">
              Real‑time inventory tracking, predictive analytics, and automated reporting —
              all in one intelligent platform.
            </p> */}

            <div className="hero-features-list">
              <div className="hero-feature-item">
                <div className="feature-icon-circle">
                  <Icon name="activity" />
                </div>
                <div className="feature-text">
                  <h4>Live Insights</h4>
                  <p>Monitor staff, stock, and customer trends as they happen</p>
                </div>
              </div>
              {/* <div className="hero-feature-item">
                <div className="feature-icon-circle">
                  <Icon name="trending-up" />
                </div>
                <div className="feature-text">
                  <h4>Smart Forecasting</h4>
                  <p>AI‑driven predictions to optimize inventory and reduce waste</p>
                </div>
              </div> */}
              <div className="hero-feature-item">
                <div className="feature-icon-circle">
                  <Icon name="shield" />
                </div>
                <div className="feature-text">
                  <h4>Enterprise Security</h4>
                  <p>Bank‑grade encryption and role‑based access control</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
