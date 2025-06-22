import React from 'react';
import '../styles/FormTextarea.css';

const FormTextarea = ({
  id,
  label,
  value,
  onChange,
  placeholder = "",
  rows = 4,
  required = false,
  disabled = false
}) => (
  <div className="form-group">
    <label htmlFor={id} className="text-white">{label}</label>
    <textarea
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      required={required}
      disabled={disabled}
      className="custom-textarea"
    />
  </div>
);

export default FormTextarea;