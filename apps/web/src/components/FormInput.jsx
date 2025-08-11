export default function FormInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  eye
}) {
  return (
    <div className={`form-group ${error ? "has-error" : ""}`}>
      <label htmlFor={id} className="text-white">{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="custom-input"
        style={eye && { paddingRight: "50px" }}
      />
      {error && <div className="input-error">{error}</div>}
    </div>
  );
}