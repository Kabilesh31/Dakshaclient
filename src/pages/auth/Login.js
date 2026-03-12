import React, { useState, useEffect } from "react";
import Head from "../../layout/head/Head";
import { Button, Col, Icon } from "../../components/Component";
import { Form, FormGroup, Spinner, Alert, Row } from "reactstrap";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { errorToast, successToast } from "../../utils/toaster";
import "./Login.css";
import Logo from "../../assets/images/image.png";
const Login = () => {
  const [loading, setLoading] = useState(false);
  const [passState, setPassState] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }).map(() => ({
      id: Math.random(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 20 + 10,
      speed: Math.random() * 0.5 + 0.2,
      opacity: Math.random() * 0.3 + 0.1,
    }));
    setParticles(newParticles);
  }, []);

  const onFormSubmit = async (e) => {
    if (!email || !password) {
      errorToast("Email and Password are required");
      return;
    }
    setLoading(true);
    const loginUser = {
      email: email,
      password: password,
    };
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
            `${process.env.PUBLIC_URL ? process.env.PUBLIC_URL : "/"}`,
          );
          window.location.reload();
        }, 2000);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const { errors, register, handleSubmit } = useForm();

  return (
    <div className="premium-login-container">
      <Head title="Login | Retail Pulse" />

      {/* Animated Background */}
      <div className="animated-background">
        <div className="gradient-bg"></div>
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="floating-particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              animationDuration: `${particle.speed * 10 + 5}s`,
            }}
          />
        ))}
        <div className="shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      <Row className="no-gutters h-100">
        {/* Hero Section */}
        <Col lg="7" className="d-none d-lg-block hero-section">
          <div className="hero-content">
            <div className="hero-overlay">
              <div className="hero-text">
                <div className="hero-logo">
                  <img src={Logo} alt="Retail Pulse Logo" className="hero-logo-img" />
                </div>

                <div className="hero-features">
                  <div className="feature-card">
                    <div className="feature-icon">
                      <Icon name="zap" />
                    </div>
                    <div className="feature-content">
                      <h4>Real-time Tracking</h4>
                      <p>Instant insights for smarter decisions</p>
                    </div>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon"></div>
                    <div className="feature-content">
                      <h4>Products Management</h4>
                      <p>Manage Your Products and Customers with us</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Col>

        {/* Login Form Section */}
        <Col lg="5" className="form-section">
          <div className="form-container">
            <div className="form-card">
              {/* Form Header */}
              <div className="form-header">
                <div className="form-brand">
                  <h3 className="brand-name">Retail Pulse</h3>
                </div>
                <h2 className="welcome-text">
                  Welcome Back<span className="welcome-dot"></span>
                </h2>
                <p className="form-subtitle">Sign in to access your retail analytics dashboard</p>
              </div>

              {/* Login Form */}
              <Form onSubmit={handleSubmit(onFormSubmit)} className="premium-form">
                <FormGroup className="form-group-premium">
                  <div className="input-header">
                    <label className="input-label " style={{ color: "whitesmoke" }}>
                      <Icon name="mail" className="label-icon mr-1" />
                      Email Address
                    </label>
                  </div>
                  <div className="input-wrapper">
                    <div className="input-group">
                      <input
                        type="email"
                        className="form-input"
                        placeholder="Enter your work email"
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
                      <div className="input-border"></div>
                      <Icon name="user" className="input-icon" />
                    </div>
                    {errors.email && (
                      <div className="error-message">
                        <Icon name="alert-circle" size="sm" />
                        <span>{errors.email.message}</span>
                      </div>
                    )}
                  </div>
                </FormGroup>

                <FormGroup className="form-group-premium">
                  <div className="input-header">
                    <label className="input-label" style={{ color: "whitesmoke" }}>
                      <Icon name="lock" className="label-icon mr-1" />
                      Password
                    </label>
                    <Link to={`${process.env.PUBLIC_URL}/auth-reset`} className="forgot-link">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="input-wrapper">
                    <div className="input-group">
                      <input
                        type={passState ? "text" : "password"}
                        className="form-input"
                        placeholder="Enter your password"
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
                      <div className="input-border"></div>
                      <Icon name="key" className="input-icon" />
                      <button type="button" className="password-toggle" onClick={() => setPassState(!passState)}>
                        <Icon name={passState ? "eye-off" : "eye"} />
                      </button>
                    </div>
                    {errors.password && (
                      <div className="error-message">
                        <Icon name="alert-circle" size="sm" />
                        <span>{errors.password.message}</span>
                      </div>
                    )}
                  </div>
                </FormGroup>

                <div className="form-options"></div>

                <Button
                  className={`submit-btn ${isHovered ? "hovered" : ""}`}
                  type="submit"
                  disabled={loading}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Icon name="log-in" className="mr-2" />
                      Sign In to Dashboard
                    </>
                  )}
                </Button>
              </Form>
            </div>

            {/* Footer */}
            <div className="form-footer">
              <p className="footer-text">
                © {new Date().getFullYear()} Retail Pulse. All rights reserved.
                <Link to="/privacy" className="footer-link">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="footer-link">
                  Terms of Service
                </Link>
              </p>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Login;
