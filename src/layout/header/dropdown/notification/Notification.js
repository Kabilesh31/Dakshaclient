import React, { useEffect, useState } from "react";
import { DropdownToggle, DropdownMenu, UncontrolledDropdown } from "reactstrap";
import axios from "axios";
import Icon from "../../../../components/icon/Icon";
import "./notification.css";

const NotificationItem = ({ id, text, timeAgo, seen, onMarkRead }) => {
  return (
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
};

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/notifications");

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

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.patch(`${process.env.REACT_APP_BACKENDURL}/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, seen: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(`${process.env.REACT_APP_BACKENDURL}/api/notifications/read-all`);
      setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })));
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.seen).length;

  return (
    <UncontrolledDropdown className="user-dropdown">
      <DropdownToggle tag="a" className="dropdown-toggle nk-quick-nav-icon">
        <div className="icon-status icon-status-info">
          <Icon name="bell" />
          {unreadCount > 0 && <span className="badge-dot">{unreadCount}</span>}
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
                  key={item._id}
                  id={item._id}
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
