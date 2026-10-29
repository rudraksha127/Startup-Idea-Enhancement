interface LeadStatusBadgeProps {
  status: string;
}

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const getBadgeClass = (s: string) => {
    switch (s) {
      case "New":
        return "badge-new";
      case "Contacted":
        return "badge-contacted";
      case "Interested":
        return "badge-interested";
      case "Replied":
        return "badge-replied";
      case "Converted":
        return "badge-converted";
      case "Archived":
        return "badge-archived";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getBadgeClass(
        status
      )}`}
    >
      {status}
    </span>
  );
}

