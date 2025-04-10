import React from "react";

interface NotificationBadgeProps {
  count: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count }) => {
  if (count === 0) return null;

  const badgeStyle: React.CSSProperties = {
    position: "absolute",
    top: "-8px",
    right: "-8px",
    backgroundColor: "var(--primary-color)",
    color: "white",
    borderRadius: "50%",
    padding: "2px 6px",
    fontSize: "0.75rem",
    minWidth: "18px",
    height: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  };

  return <span style={badgeStyle}>{count > 99 ? "99+" : count}</span>;
};

export default NotificationBadge;
