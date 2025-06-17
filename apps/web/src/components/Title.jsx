import "../styles/Title.css";

const Title = ({ children, className = "" }) => {
  return <h2 className={`section-title ${className}`}>{children}</h2>;
};

export default Title;