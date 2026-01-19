import React from "react";
import Icon from "../../components/icon/Icon";

const Toggle = ({ className, click, icon }) => {
  return (
    <a
      href="#toggle"
      className={className ? className : ""}
      onClick={(ev) => {
        ev.preventDefault();
        click(ev);
      }}
    >
      <Icon style={{color:"white"}} name={icon} />
    </a>
  );
};
export default Toggle;
