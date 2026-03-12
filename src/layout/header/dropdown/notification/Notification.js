import React, { useEffect, useState, useMemo } from "react";
import { UncontrolledDropdown, DropdownToggle, DropdownMenu } from "reactstrap";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import Icon from "../../../../components/icon/Icon";
import "./notification.css";

const BACKEND_URL = process.env.REACT_APP_BACKENDURL || "http://localhost:8000";

const NotificationItem = ({ id, text, timeAgo, seen, onMarkRead, referenceId, type }) => {
  const history = useHistory();

  const handleClick = async () => {
    // Mark as read
    if (!seen) {
      await onMarkRead(id);
    }

    // Navigate based on type
    if (type === "bill" && referenceId) {
      history.push({
        pathname: "/orders",
        state: { highlightOrderId: referenceId },
      });
    }
  };

  return (
    <div
      className={`nk-notification-item ${!seen ? "unread" : ""}`}
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
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
          onClick={(e) => {
            e.stopPropagation();
            onMarkRead(id);
          }}
          title="Mark as read"
        >
          ✔
        </button>
      )}
    </div>
  );
};

const Notification = () => {
  const history = useHistory();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "session-token": localStorage.getItem("sessionToken"),
        },
      });

      const data = res.data.map((n) => ({
        ...n,
        id: n._id,
        text: n.message,
        referenceId: n.referenceId,
        type: n.type,
        timeAgo: n.timeAgo,
      }));

      setNotifications(data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const socket = io(BACKEND_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

    socket.on("newNotification", (notification) => {
      setNotifications((prev) => [
        {
          ...notification,
          id: notification._id,
          text: notification.message,
          referenceId: notification.referenceId,
          type: notification.type,
          timeAgo: "just now",
          seen: false,
        },
        ...prev,
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.patch(
        `${BACKEND_URL}/api/notifications/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "session-token": localStorage.getItem("sessionToken"),
          },
        },
      );

      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, seen: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(
        `${BACKEND_URL}/api/notifications/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "session-token": localStorage.getItem("sessionToken"),
          },
        },
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = useMemo(() => notifications.filter((n) => !n.seen).length, [notifications]);

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
            onClick={(e) => {
              e.preventDefault();
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
                  referenceId={item.referenceId}
                  type={item.type}
                  onMarkRead={markAsRead}
                />
              ))
            ) : (
              <div className="text-center p-3">No notifications</div>
            )}
          </div>
        </div>

        <div className="dropdown-foot center">
          <a
            href="#viewall"
            onClick={(e) => {
              e.preventDefault();
              history.push("/orders");
            }}
          >
            View All
          </a>
        </div>
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

export default Notification;
