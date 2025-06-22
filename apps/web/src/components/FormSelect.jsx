const FormSelect = ({
  label,
  name,
  value,
  options,
  onChange,
  required = false,
  disabled = false,
  placeholder
}) => {
  return (
    <div className="form-group">
      <label htmlFor={name} className='text-white' >{label}</label>
      <select
        id={name}
        name={name}
        value={value !== null && value !== undefined ? value : ''}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="custom-select"
        placeholder={placeholder}
      >
        <option value="" disabled hidden>{placeholder}</option>
        {options.map((opt, index) => (
          <option key={`${opt.value}-${index}`} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FormSelect;