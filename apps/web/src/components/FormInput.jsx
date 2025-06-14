import React from 'react';

const FormInput = ({ id, label, type = "text", value, onChange, placeholder, autocomplete, required = false, disabled = false }) => (
  <div className="form-group">
    <label htmlFor={id} className='text-white' >{label}</label>
    <input
      id={id}
      name={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autocomplete}
      required={required}
      disabled={disabled}
      className="custom-input"
    />
  </div>
);

export default FormInput;