import React, { useState, useEffect } from "react";

const InputSwitch = ({ label, id, checked, onChange, disabled }) => {
  const [inputCheck, setCheck] = useState(checked ? true : false);


  useEffect(() => {
    setCheck(checked);
  }, [checked]);


  const handleChange = (e) => {
    setCheck(e.target.checked);
    if (onChange) {
      onChange(e); // Call the parent handler
    }
  };
  return (
    <React.Fragment>
      <input
        disabled = {disabled}
        type="checkbox"
        className="custom-control-input"
        defaultChecked={inputCheck}
        onClick={() => setCheck(!inputCheck)}
        onChange={handleChange}
        id={id}
      />
      <label className="custom-control-label" htmlFor={id}>
        {label}
      </label>
    </React.Fragment>
  );
};

export default InputSwitch;
