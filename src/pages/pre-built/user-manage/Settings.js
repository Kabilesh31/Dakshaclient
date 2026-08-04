import React, { useState } from "react";
import Head from "../../../layout/head/Head";
import Content from "../../../layout/content/Content";
import {
  Block,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  BlockDes,
  Row,
  Col,
  Button,
  PreviewCard,
  Icon,
  RSelect,
} from "../../../components/Component";
import {
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  FormGroup,
  Label,
  Input,
  FormText,
  CustomInput,
} from "reactstrap";
import "./settings.css";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");

  // Profile Settings
  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@daksha.com",
    phone: "+91 98765 43210",
    company: "Daksha Enterprises",
    role: "Super Admin",
    language: "english",
    timezone: "asia/kolkata",
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: false,
    smsAlerts: true,
    orderUpdates: true,
    promotionalEmails: false,
    staffActivity: true,
    reportReady: true,
  });

  // Security Settings
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: "30",
    loginNotifications: true,
    deviceManagement: true,
  });

  // Appearance Settings
  const [appearance, setAppearance] = useState({
    theme: "light",
    compactView: false,
    animations: true,
    fontSize: "medium",
  });

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    shareAnalytics: true,
    showOnlineStatus: true,
    allowDataExport: true,
    deleteAccountRequest: false,
  });

  // Options for RSelect
  const languageOptions = [
    { value: "english", label: "English" },
    { value: "hindi", label: "Hindi" },
    { value: "tamil", label: "Tamil" },
    { value: "telugu", label: "Telugu" },
    { value: "kannada", label: "Kannada" },
    { value: "malayalam", label: "Malayalam" },
  ];

  const timezoneOptions = [
    { value: "asia/kolkata", label: "Asia/Kolkata (IST)" },
    { value: "asia/dubai", label: "Asia/Dubai (GST)" },
    { value: "america/new_york", label: "America/New York (EST)" },
    { value: "europe/london", label: "Europe/London (GMT)" },
  ];

  const sessionTimeoutOptions = [
    { value: "15", label: "15 minutes" },
    { value: "30", label: "30 minutes" },
    { value: "60", label: "1 hour" },
    { value: "120", label: "2 hours" },
  ];

  const fontSizeOptions = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
  ];

  // Selected values for RSelect
  const selectedLanguage = languageOptions.find(opt => opt.value === profile.language);
  const selectedTimezone = timezoneOptions.find(opt => opt.value === profile.timezone);
  const selectedSessionTimeout = sessionTimeoutOptions.find(opt => opt.value === security.sessionTimeout);
  const selectedFontSize = fontSizeOptions.find(opt => opt.value === appearance.fontSize);

  // Custom styles for RSelect
  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: '38px',
      borderColor: '#e8e4e0',
      '&:hover': {
        borderColor: '#e8e4e0',
      },
      boxShadow: 'none',
      cursor: 'pointer',
      borderRadius: '6px',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#4B5694' : state.isFocused ? '#f0f0f0' : 'transparent',
      color: state.isSelected ? '#fff' : '#333',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: state.isSelected ? '#4B5694' : '#f0f0f0',
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 999,
      marginTop: '4px',
      borderRadius: '6px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: '200px',
      borderRadius: '6px',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#6c757d',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#1a1a2e',
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: '#6c757d',
      '&:hover': {
        color: '#1a1a2e',
      },
    }),
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleLanguageChange = (option) => {
    if (option) {
      setProfile({ ...profile, language: option.value });
    }
  };

  const handleTimezoneChange = (option) => {
    if (option) {
      setProfile({ ...profile, timezone: option.value });
    }
  };

  const handleSessionTimeoutChange = (option) => {
    if (option) {
      setSecurity({ ...security, sessionTimeout: option.value });
    }
  };

  const handleFontSizeChange = (option) => {
    if (option) {
      setAppearance({ ...appearance, fontSize: option.value });
    }
  };

  const handleNotificationToggle = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const handleSecurityToggle = (key) => {
    setSecurity({ ...security, [key]: !security[key] });
  };

  const handleAppearanceToggle = (key) => {
    setAppearance({ ...appearance, [key]: !appearance[key] });
  };

  const handleAppearanceChange = (e) => {
    setAppearance({ ...appearance, [e.target.name]: e.target.value });
  };

  const handlePrivacyToggle = (key) => {
    setPrivacy({ ...privacy, [key]: !privacy[key] });
  };

  const handleSaveSettings = () => {
    console.log("Saving settings:", { profile, notifications, security, appearance, privacy });
    alert("Settings saved successfully!");
  };

  return (
    <React.Fragment>
      <Head title="Settings" />
      <Content>
        <BlockHead size="sm">
          <BlockHeadContent>
            <BlockTitle page tag="h3">
              Settings
            </BlockTitle>
            <BlockDes className="text-soft">
              <p>Manage your account, notification preferences, and app appearance</p>
            </BlockDes>
          </BlockHeadContent>
        </BlockHead>

        <Block>
          <Row className="g-gs">
            <Col xl="11" lg="12">
              <PreviewCard className="settings-content-card">
                <div className="card-body">
                  <TabContent activeTab={activeTab}>
                    {/* Profile Tab */}
                    <TabPane tabId="profile">
                      <div className="settings-section">
                        <h5 className="settings-title">Profile Information</h5>
                        <p className="settings-subtitle">Update your account details and personal information</p>
                        <Row className="g-gs mt-3">
                          <Col md="6">
                            <FormGroup>
                              <Label>Full Name</Label>
                              <Input type="text" name="name" value={profile.name} onChange={handleProfileChange} />
                            </FormGroup>
                          </Col>
                          <Col md="6">
                            <FormGroup>
                              <Label>Email Address</Label>
                              <Input type="email" name="email" value={profile.email} onChange={handleProfileChange} />
                            </FormGroup>
                          </Col>
                          <Col md="6">
                            <FormGroup>
                              <Label>Phone Number</Label>
                              <Input type="tel" name="phone" value={profile.phone} onChange={handleProfileChange} />
                            </FormGroup>
                          </Col>
                          <Col md="6">
                            <FormGroup>
                              <Label>Company Name</Label>
                              <Input type="text" name="company" value={profile.company} onChange={handleProfileChange} />
                            </FormGroup>
                          </Col>
                          <Col md="6">
                            <FormGroup>
                              <Label>Role</Label>
                              <Input type="text" name="role" value={profile.role} disabled />
                              <FormText color="muted">Role cannot be changed. Contact support for role changes.</FormText>
                            </FormGroup>
                          </Col>
                          {/* <Col md="6">
                            <FormGroup>
                              <Label>Language</Label>
                              <RSelect
                                options={languageOptions}
                                value={selectedLanguage}
                                onChange={handleLanguageChange}
                                placeholder="Select Language"
                                isClearable={false}
                                styles={selectStyles}
                                classNamePrefix="react-select"
                              />
                            </FormGroup>
                          </Col> */}
                          <Col md="6">
                            <FormGroup>
                              <Label>Time Zone</Label>
                              <RSelect
                                options={timezoneOptions}
                                value={selectedTimezone}
                                onChange={handleTimezoneChange}
                                placeholder="Select Time Zone"
                                isClearable={false}
                                styles={selectStyles}
                                classNamePrefix="react-select"
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        <div className="settings-actions mt-4 ">
                          <Button style={{
                            backgroundColor: "#4B5694",
                            borderColor: "#800000",
                            marginRight: "0.5rem",
                            color: "#fff",
                            padding: "8px 20px"
                          }} onClick={handleSaveSettings}>Save</Button>
                          {/* <Button color="secondary" outline className="ms-2">Cancel</Button> */}
                        </div>
                      </div>
                    </TabPane>

                    {/* Notifications Tab - using CustomInput switch */}
                    <TabPane tabId="notifications">
                      <div className="settings-section">
                        <h5 className="settings-title">Notification Preferences</h5>
                        <p className="settings-subtitle">Choose how you want to receive updates and alerts</p>
                        <div className="notification-settings mt-4">
                          {[
                            { key: "emailAlerts", label: "Email Alerts", desc: "Receive important updates via email" },
                            { key: "pushNotifications", label: "Push Notifications", desc: "Get real-time alerts on your device" },
                            { key: "smsAlerts", label: "SMS Alerts", desc: "Critical updates via text message" },
                            { key: "orderUpdates", label: "Order Status Updates", desc: "Notifications when orders are created or updated" },
                            { key: "promotionalEmails", label: "Promotional Emails", desc: "News, offers, and product updates" },
                            { key: "staffActivity", label: "Staff Activity Alerts", desc: "Get notified about staff actions and performance" },
                            { key: "reportReady", label: "Reports Ready", desc: "Notification when generated reports are available" },
                          ].map((item) => (
                            <div key={item.key} className="d-flex justify-content-between align-items-center py-3 border-bottom">
                              <div>
                                <h6 className="mb-1">{item.label}</h6>
                                <p className="text-soft small mb-0">{item.desc}</p>
                              </div>
                              <CustomInput
                                type="switch"
                                id={item.key}
                                checked={notifications[item.key]}
                                onChange={() => handleNotificationToggle(item.key)}
                                label=""
                              />
                            </div>
                          ))}
                        </div>
                        <div className="settings-actions mt-4">
                          <Button color="primary" onClick={handleSaveSettings}>Save Notification Settings</Button>
                        </div>
                      </div>
                    </TabPane>

                    {/* Security Tab */}
                    <TabPane tabId="security">
                      <div className="settings-section">
                        <h5 className="settings-title">Security Settings</h5>
                        <p className="settings-subtitle">Protect your account with advanced security options</p>
                        <div className="security-settings mt-4">
                          <div className="d-flex justify-content-between align-items-center py-3 border-bottom">
                            <div>
                              <h6 className="mb-1">Two-Factor Authentication (2FA)</h6>
                              <p className="text-soft small mb-0">Add an extra layer of security to your account</p>
                            </div>
                            <CustomInput type="switch" id="twoFactorAuth" checked={security.twoFactorAuth} onChange={() => handleSecurityToggle("twoFactorAuth")} label="" />
                          </div>
                          <div className="py-3 border-bottom">
                            <h6 className="mb-1">Session Timeout</h6>
                            <p className="text-soft small mb-0">Automatically log out after inactivity</p>
                            <div style={{ width: "200px", marginTop: "8px" }}>
                              <RSelect
                                options={sessionTimeoutOptions}
                                value={selectedSessionTimeout}
                                onChange={handleSessionTimeoutChange}
                                placeholder="Select Timeout"
                                isClearable={false}
                                styles={selectStyles}
                                classNamePrefix="react-select"
                              />
                            </div>
                          </div>
                          <div className="d-flex justify-content-between align-items-center py-3 border-bottom">
                            <div>
                              <h6 className="mb-1">Login Notifications</h6>
                              <p className="text-soft small mb-0">Get email alerts for new login activities</p>
                            </div>
                            <CustomInput type="switch" id="loginNotifications" checked={security.loginNotifications} onChange={() => handleSecurityToggle("loginNotifications")} label="" />
                          </div>
                          <div className="d-flex justify-content-between align-items-center py-3">
                            <div>
                              <h6 className="mb-1">Device Management</h6>
                              <p className="text-soft small mb-0">Manage active sessions and trusted devices</p>
                            </div>
                            <CustomInput type="switch" id="deviceManagement" checked={security.deviceManagement} onChange={() => handleSecurityToggle("deviceManagement")} label="" />
                          </div>
                        </div>
                        <div className="settings-actions mt-4">
                          <Button color="primary" onClick={handleSaveSettings}>Save Security Settings</Button>
                          <Button color="danger" outline className="ms-2">Change Password</Button>
                        </div>
                      </div>
                    </TabPane>

                    {/* Appearance Tab */}
                    <TabPane tabId="appearance">
                      <div className="settings-section">
                        <h5 className="settings-title">Appearance</h5>
                        <p className="settings-subtitle">Customize how the dashboard looks and feels</p>
                        <div className="appearance-settings mt-4">
                          <div className="py-3 border-bottom">
                            <h6 className="mb-2">Theme Mode</h6>
                            <div className="d-flex gap-3">
                              <Button color={appearance.theme === "light" ? "primary" : "light"} onClick={() => setAppearance({ ...appearance, theme: "light" })}><Icon name="sun" /> Light</Button>
                              <Button color={appearance.theme === "dark" ? "primary" : "light"} onClick={() => setAppearance({ ...appearance, theme: "dark" })}><Icon name="moon" /> Dark</Button>
                              <Button color={appearance.theme === "system" ? "primary" : "light"} onClick={() => setAppearance({ ...appearance, theme: "system" })}><Icon name="monitor" /> System Default</Button>
                            </div>
                          </div>
                          <div className="d-flex justify-content-between align-items-center py-3 border-bottom">
                            <div>
                              <h6 className="mb-1">Compact View</h6>
                              <p className="text-soft small mb-0">Reduce spacing to show more content</p>
                            </div>
                            <CustomInput type="switch" id="compactView" checked={appearance.compactView} onChange={() => handleAppearanceToggle("compactView")} label="" />
                          </div>
                          <div className="d-flex justify-content-between align-items-center py-3 border-bottom">
                            <div>
                              <h6 className="mb-1">Animations</h6>
                              <p className="text-soft small mb-0">Enable smooth transitions and effects</p>
                            </div>
                            <CustomInput type="switch" id="animations" checked={appearance.animations} onChange={() => handleAppearanceToggle("animations")} label="" />
                          </div>
                          <div className="py-3">
                            <h6 className="mb-2">Font Size</h6>
                            <div style={{ width: "200px" }}>
                              <RSelect
                                options={fontSizeOptions}
                                value={selectedFontSize}
                                onChange={handleFontSizeChange}
                                placeholder="Select Font Size"
                                isClearable={false}
                                styles={selectStyles}
                                classNamePrefix="react-select"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="settings-actions mt-4">
                          <Button color="primary" onClick={handleSaveSettings}>Save Appearance Settings</Button>
                        </div>
                      </div>
                    </TabPane>

                    {/* Privacy Tab */}
                    <TabPane tabId="privacy">
                      <div className="settings-section">
                        <h5 className="settings-title">Privacy & Data</h5>
                        <p className="settings-subtitle">Control your data and privacy preferences</p>
                        <div className="privacy-settings mt-4">
                          <div className="d-flex justify-content-between align-items-center py-3 border-bottom">
                            <div>
                              <h6 className="mb-1">Share Anonymous Analytics</h6>
                              <p className="text-soft small mb-0">Help us improve by sharing usage data</p>
                            </div>
                            <CustomInput type="switch" id="shareAnalytics" checked={privacy.shareAnalytics} onChange={() => handlePrivacyToggle("shareAnalytics")} label="" />
                          </div>
                          <div className="d-flex justify-content-between align-items-center py-3 border-bottom">
                            <div>
                              <h6 className="mb-1">Show Online Status</h6>
                              <p className="text-soft small mb-0">Let other staff see when you're active</p>
                            </div>
                            <CustomInput type="switch" id="showOnlineStatus" checked={privacy.showOnlineStatus} onChange={() => handlePrivacyToggle("showOnlineStatus")} label="" />
                          </div>
                          <div className="d-flex justify-content-between align-items-center py-3 border-bottom">
                            <div>
                              <h6 className="mb-1">Allow Data Export</h6>
                              <p className="text-soft small mb-0">Enable downloading your account data</p>
                            </div>
                            <CustomInput type="switch" id="allowDataExport" checked={privacy.allowDataExport} onChange={() => handlePrivacyToggle("allowDataExport")} label="" />
                          </div>
                          <div className="py-3">
                            <h6 className="mb-1 text-danger">Delete Account</h6>
                            <p className="text-soft small mb-2">Permanently delete your account and all data</p>
                            <Button color="danger" outline onClick={() => { if (window.confirm("Are you sure? This action cannot be undone!")) { setPrivacy({ ...privacy, deleteAccountRequest: true }); alert("Account deletion request submitted. Support will contact you."); } }}>Request Account Deletion</Button>
                          </div>
                        </div>
                        <div className="settings-actions mt-4">
                          <Button color="primary" onClick={handleSaveSettings}>Save Privacy Settings</Button>
                        </div>
                      </div>
                    </TabPane>
                  </TabContent>
                </div>
              </PreviewCard>
            </Col>
          </Row>
        </Block>
      </Content>
    </React.Fragment>
  );
};

export default Settings;