import React from "react";
import classNames from "classnames";
import Toggle from "../sidebar/Toggle";
import Logo from "../logo/Logo";
import News from "../news/News";
import User from "./dropdown/user/User";
import Notification from "./dropdown/notification/Notification";
import { useHistory, useLocation } from "react-router-dom";
import { Icon, Button } from "../../components/Component";

const Header = ({ fixed, theme, className, setVisibility, ...props }) => {
  const headerClass = classNames({
    "nk-header": true,
    "nk-header-fixed": fixed,
    [`is-light`]: theme === "white",
    [`is-${theme}`]: theme !== "white" && theme !== "light",
    [`${className}`]: className,
  });
  const history = useHistory();
  const location = useLocation();

  // Define routes where Back button should be shown
  const routesWithBackButton = [
    "/Suppliers/",
    "/SiteManagement/site/",
    "/material-request-details/",
    "/purchase-order",
    "/Buying/",
     "/staff-attendance/" 
  ];

  // Check if current path matches any of the routes
  const shouldShowBackButton = routesWithBackButton.some(route => 
    location.pathname.startsWith(route)
  );

  return (
    <div className={headerClass}>
      <div className="container-fluid">
        <div className="nk-header-wrap">
          <div className="nk-menu-trigger d-xl-none ml-n1">
            <Toggle
              className="nk-nav-toggle nk-quick-nav-icon d-xl-none ml-n1"
              icon="menu"
              click={props.sidebarToggle}
            />
          </div>
          <div className="nk-header-brand d-xl-none">
            <Logo />
          </div>
          <div className="nk-header-news mt-2 d-none d-xl-block">
            {shouldShowBackButton && (
              <Button
                color="dark"
                size="sm"
                className="mb-2"
                onClick={() => history.goBack()}
              >
                <Icon name="arrow-left" /> Back
              </Button>
            )}
          </div>
          <div className="nk-header-tools">
            <ul className="nk-quick-nav">
              <li className="user-dropdown" onClick={() => setVisibility(false)}>
                <User />
              </li>
              <li className="notification-dropdown mr-n1" onClick={() => setVisibility(false)}>
                <Notification />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;