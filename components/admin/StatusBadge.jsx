export default function StatusBadge({ status, labels = {} }) {
  return <span>{labels[status] || status || "未知"}</span>;
}
