export default function FormField({ label, value = "", placeholder = "" }) {
  return (
    <label>
      <span>{label}</span>
      <input defaultValue={value} placeholder={placeholder || label} />
    </label>
  );
}
