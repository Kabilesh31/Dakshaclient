import React, { useEffect, useState, useMemo } from "react";
import { UncontrolledDropdown, DropdownToggle, DropdownMenu } from "reactstrap";
import axios from "axios";
import { io } from "socket.io-client";
import Icon from "../../../../components/icon/Icon";
import "./notification.css";

// Notification Item
const NotificationItem = ({ id, text, timeAgo, seen, onMarkRead }) => (
  <div className={`nk-notification-item ${!seen ? "unread" : ""}`} key={id}>
    <div className="nk-notification-icon">
      <Icon name="bell" className="icon-circle icon-info" />
    </div>
    <div className="nk-notification-content">
      <div className="nk-notification-text">{text}</div>
      <div className="nk-notification-time">{timeAgo}</div>
    </div>
    {!seen && (
      <button
        className="mark-read-btn"
        onClick={() => onMarkRead(id)}
        title="Mark as read"
      >
        ✔
      </button>
    )}
  </div>
);

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = process.env.REACT_APP_BACKENDURL || "http://localhost:8000";

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/notifications`);
      const data = res.data.map((n) => ({
        ...n,
        id: n._id,
        text: n.message,
        timeAgo: n.timeAgo,
      }));
      setNotifications(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
      setLoading(false);
    }
  };

  // Mark single notification as read
  const markAsRead = async (id) => {
    try {
      await axios.patch(`${BACKEND_URL}/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, seen: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.patch(`${BACKEND_URL}/api/notifications/read-all`);
      setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })));
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    }
  };

  // Compute unread count dynamically
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.seen).length,
    [notifications]
  );

useEffect(() => {
  fetchNotifications();

  const socket = io(BACKEND_URL);

  // Make sure userId comes from login/auth context
  const userId = localStorage.getItem("staffId"); // or from auth
  if (userId) {
    socket.emit("joinRoom", userId);
  }

  socket.on("newNotification", (notification) => {
    setNotifications((prev) => [
      {
        ...notification,
        id: notification._id || notification.id,
        text: notification.message || notification.text,
        timeAgo: notification.timeAgo || "just now",
        seen: false,
      },
      ...prev,
    ]);
  });

  return () => socket.disconnect();
}, []);



  return (
    <UncontrolledDropdown className="user-dropdown">
      <DropdownToggle tag="a" className="dropdown-toggle nk-quick-nav-icon">
        <div className="icon-status icon-status-info">
          <Icon name="bell" />
          {unreadCount > 0 && (
            <span className="badge-dot">{unreadCount}</span>
          )}
        </div>
      </DropdownToggle>

      <DropdownMenu right className="dropdown-menu-xl dropdown-menu-s1">
        <div className="dropdown-head">
          <span className="sub-title nk-dropdown-title">Notifications</span>
          <a
            href="#markasread"
            onClick={(ev) => {
              ev.preventDefault();
              markAllAsRead();
            }}
          >
            Mark All as Read
          </a>
        </div>

        <div className="dropdown-body">
          <div className="nk-notification">
            {loading ? (
              <div className="text-center p-3">Loading...</div>
            ) : notifications.length > 0 ? (
              notifications.map((item) => (
                <NotificationItem
                  key={item.id}
                  id={item.id}
                  text={item.text}
                  timeAgo={item.timeAgo}
                  seen={item.seen}
                  onMarkRead={markAsRead}
                />
              ))
            ) : (
              <div className="text-center p-3">No notifications</div>
            )}
          </div>
        </div>

        <div className="dropdown-foot center">
          <a href="#viewall" onClick={(ev) => ev.preventDefault()}>
            View All
          </a>
        </div>
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

export default Notification;
