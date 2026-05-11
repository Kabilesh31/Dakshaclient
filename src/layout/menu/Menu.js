import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import menu from "./MenuData";
import Icon from "../../components/icon/Icon";
import classNames from "classnames";
import { NavLink, Link } from "react-router-dom";

const MenuHeading = ({ heading }) => {
  return (
    <li className="nk-menu-heading">
      <h6 className="overline-title text-primary-alt">{heading}</h6>
    </li>
  );
};

const MenuItem = ({ icon, link, text, sub, newTab, sidebarToggle, mobileView, badge, ...props }) => {
  const location = useLocation();
  const toggleActionSidebar = (e) => {
    if (!sub && !newTab && mobileView) {
      sidebarToggle(e);
    }
  };

  // ---------- Active check: exact match OR prefix (for child routes) ----------
const isActive = () => {
  const currentPath = location.pathname.toLowerCase();
  const menuPath = (process.env.PUBLIC_URL + link).toLowerCase();

  // Suppliers active on details page
  if (
    menuPath.includes("/suppliers") &&
    currentPath.startsWith(
      `${process.env.PUBLIC_URL.toLowerCase()}/suppliers`
    )
  ) {
    return true;
  }

  // Material Request active on details page
  if (
    menuPath.includes("/material-request") &&
    (
      currentPath.startsWith(
        `${process.env.PUBLIC_URL.toLowerCase()}/material-request`
      ) ||
      currentPath.startsWith(
        `${process.env.PUBLIC_URL.toLowerCase()}/material-request-details`
      )
    )
  ) {
    return true;
  }

  // Purchase Order active on details page
  if (
    menuPath.includes("/purchase-order") &&
    (
      currentPath.startsWith(
        `${process.env.PUBLIC_URL.toLowerCase()}/purchase-order`
      ) ||
      currentPath.startsWith(
        `${process.env.PUBLIC_URL.toLowerCase()}/purchase-order-details`
      )
    )
  ) {
    return true;
  }

  return (
    currentPath === menuPath ||
    currentPath.startsWith(menuPath + "/")
  );
};
  const menuHeight = (el) => {
    let totalHeight = [];
    for (let i = 0; i < el.length; i++) {
      const margin =
        parseInt(window.getComputedStyle(el[i]).marginTop.slice(0, -2)) +
        parseInt(window.getComputedStyle(el[i]).marginBottom.slice(0, -2));
      const padding =
        parseInt(window.getComputedStyle(el[i]).paddingTop.slice(0, -2)) +
        parseInt(window.getComputedStyle(el[i]).paddingBottom.slice(0, -2));
      const height = el[i].clientHeight + margin + padding;
      totalHeight.push(height);
    }
    totalHeight = totalHeight.reduce((sum, value) => (sum += value), 0);
    return totalHeight;
  };

  const makeParentActive = (el, childHeight) => {
    let element = el.parentElement?.parentElement?.parentElement;
    let wrap = el.parentElement?.parentElement;
    if (element && element.classList && element.classList[0] === "nk-menu-item") {
      element.classList.add("active");
      const subMenuHeight = menuHeight(el.parentNode.children);
      if (wrap) wrap.style.height = subMenuHeight + childHeight - 50 + "px";
      makeParentActive(element, childHeight);
    }
  };

  // Re-run parent activation whenever the route changes
  useEffect(() => {
    const activeItems = document.querySelectorAll(".nk-menu-item.active.current-page");
    activeItems.forEach((dom) => {
      let parent = dom.parentElement?.parentElement?.parentElement;
      if (parent && parent.classList && parent.classList[0] === "nk-menu-item") {
        parent.classList.add("active");
        const subMenuHeight = menuHeight(dom.parentNode.children);
        if (dom.parentElement?.parentElement) {
          dom.parentElement.parentElement.style.height = subMenuHeight + "px";
        }
        makeParentActive(parent, subMenuHeight);
      }
    });
  }, [location.pathname]);

  const menuToggle = (e) => {
    e.preventDefault();
    const self = e.target.closest(".nk-menu-toggle");
    if (!self) return;
    const parent = self.parentElement;
    const subMenu = self.nextSibling;
    const subMenuItem = subMenu?.childNodes;
    const parentSiblings = parent.parentElement?.childNodes;
    const parentMenu = parent.closest(".nk-menu-wrap");
    if (!subMenuItem) return;
    const subMenuHeight = menuHeight(subMenuItem);

    const getParents = (el, parentSelector) => {
      parentSelector = document.querySelector(".nk-menu");
      if (!parentSelector) parentSelector = document;
      const parents = [];
      let p = el.parentNode;
      while (p && p !== parentSelector) {
        parents.push(p);
        p = p.parentNode;
      }
      if (parentSelector !== document) parents.push(parentSelector);
      return parents;
    };
    const parentMenus = getParents(self);

    if (!parent.classList.contains("active")) {
      // Close siblings
      for (let j = 0; j < parentSiblings.length; j++) {
        parentSiblings[j].classList.remove("active");
        if (parentSiblings[j].childNodes[1]) {
          parentSiblings[j].childNodes[1].style.height = 0;
        }
      }
      if (parentMenu) {
        if (!parentMenu.classList.contains("sub-opened")) {
          parentMenu.classList.add("sub-opened");
          for (let l = 0; l < parentMenus.length; l++) {
            if (parentMenus[l]?.classList?.contains("nk-menu-wrap")) {
              parentMenus[l].style.height = subMenuHeight + parentMenus[l].clientHeight + "px";
            }
          }
        }
      }
      parent.classList.add("active");
      subMenu.style.height = subMenuHeight + "px";
    } else {
      parent.classList.remove("active");
      if (parentMenu) {
        parentMenu.classList.remove("sub-opened");
        for (let k = 0; k < parentMenus.length; k++) {
          if (parentMenus[k]?.classList?.contains("nk-menu-wrap")) {
            parentMenus[k].style.height = parentMenus[k].clientHeight - subMenuHeight + "px";
          }
        }
      }
      subMenu.style.height = 0;
    }
  };

  const menuItemClass = classNames({
    "nk-menu-item": true,
    "has-sub": sub,
    "active current-page": isActive(), // Now uses prefix matching
  });

  return (
    <li className={menuItemClass} onClick={(e) => toggleActionSidebar(e)}>
      {newTab ? (
        <Link
          to={`${process.env.PUBLIC_URL + link}`}
          target="_blank"
          rel="noopener noreferrer"
          className="nk-menu-link"
        >
          {icon && (
            <span className="nk-menu-icon">
              <Icon name={icon} />
            </span>
          )}
          <span className="nk-menu-text">{text}</span>
        </Link>
      ) : (
        <NavLink
          to={`${process.env.PUBLIC_URL + link}`}
          className={`nk-menu-link${sub ? " nk-menu-toggle" : ""}`}
          onClick={sub ? menuToggle : null}
        >
          {icon && (
            <span className="nk-menu-icon">
              <Icon name={icon} />
            </span>
          )}
          <span style={{ fontFamily: "'Nunito Sans', sans-serif", fontWeight: 600 }} className="nk-menu-text">
            {text}
          </span>
          {badge && <span className="nk-menu-badge">{badge}</span>}
        </NavLink>
      )}
      {sub && (
        <div className="nk-menu-wrap">
          <MenuSub sub={sub} sidebarToggle={sidebarToggle} mobileView={mobileView} />
        </div>
      )}
    </li>
  );
};

const MenuSub = ({ sub, sidebarToggle, mobileView, ...props }) => {
  return (
    <ul className="nk-menu-sub" style={props.style}>
      {sub.map((item) => (
        <MenuItem
          key={item.text}
          link={item.link}
          icon={item.icon}
          text={item.text}
          sub={item.subMenu}
          newTab={item.newTab}
          badge={item.badge}
          sidebarToggle={sidebarToggle}
          mobileView={mobileView}
        />
      ))}
    </ul>
  );
};

const Menu = ({ sidebarToggle, mobileView }) => {
  return (
    <ul className="nk-menu">
      {menu.map((item) =>
        item.heading ? (
          <MenuHeading heading={item.heading} key={item.heading} />
        ) : (
          <MenuItem
            key={item.text}
            link={item.link}
            icon={item.icon}
            text={item.text}
            sub={item.subMenu}
            badge={item.badge}
            sidebarToggle={sidebarToggle}
            mobileView={mobileView}
          />
        )
      )}
    </ul>
  );
};

export default Menu;