/**
 * Shared Chart Theme Configuration
 * Provides high-contrast, clean white tooltips for all Recharts visualizations.
 */

export const WHITE_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: "8px",
    color: "#0F172A",
    fontSize: "12px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
    padding: "8px 12px",
    zIndex: 9999,
  },
  itemStyle: {
    fontSize: "11px",
    fontWeight: 600,
    padding: "2px 0",
  },
  labelStyle: {
    color: "#0F172A",
    fontWeight: 700,
    fontSize: "12px",
    marginBottom: "4px",
  },
};

