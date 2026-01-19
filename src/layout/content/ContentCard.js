import React from "react";

const ContentCard = ({ ...props }) => {
  return (
    <div style={{margin:"80px 0px 10px 0px"}}>
      <div className="container-fluid">
        <div className="nk-content-inner">
          <div className="nk-content-body">
            {!props.page ? props.children : null}
            {props.page === "component" ? (
              <div className="components-preview wide-md mx-auto">{props.children}</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ContentCard;
