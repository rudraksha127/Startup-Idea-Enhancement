import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { LeadStatusBadge } from "@/features/leads/components/lead-status-badge";
import { ScoreRing } from "@/features/lead-intelligence/components/score-ring";
import { MetricCards } from "@/features/dashboard/components/metric-cards";
import { LiveInteractiveMap } from "@/components/maps/LiveInteractiveMap";

describe("UI Components", () => {
  it("renders LeadStatusBadge with appropriate status styles", () => {
    const { container } = render(<LeadStatusBadge status="Contacted" />);
    expect(screen.getByText("Contacted")).toBeDefined();
    expect(container.firstChild).toHaveProperty("className");
  });

  it("renders ScoreRing with percentage and label", () => {
    render(<ScoreRing label="SEO Score" score={75} />);
    expect(screen.getByText("SEO Score")).toBeDefined();
    expect(screen.getByText("75%")).toBeDefined();
  });

  it("renders MetricCards with all four dashboard indicators", () => {
    const metrics = {
      totalLeads: 1248,
      qualifiedLeads: 342,
      activeOutreaches: 156,
      convertedClients: 48,
      leadsTrend: "+18%",
      qualifiedTrend: "+12%",
      outreachTrend: "+24%",
      convertedTrend: "+8%",
    };

    render(<MetricCards metrics={metrics} />);
    expect(screen.getByText("Total Leads")).toBeDefined();
    expect(screen.getByText("1,248")).toBeDefined();
    expect(screen.getByText("Leads Contacted")).toBeDefined();
    expect(screen.getByText("342")).toBeDefined();
    expect(screen.getByText("Positive Responses")).toBeDefined();
    expect(screen.getByText("Active Clients")).toBeDefined();
  });

  it("renders LiveInteractiveMap with projected geocoordinate pins and live tile attribution", () => {
    const samplePins = [
      {
        id: "pin-1",
        name: "Spice Junction",
        category: "Restaurant",
        rating: 4.6,
        address: "Vijay Nagar, Indore, MP",
        opportunityScore: 8.2,
        location: { lat: 22.7533, lng: 75.8937 },
      },
    ];

    render(
      <LiveInteractiveMap
        businesses={samplePins}
        selectedBusiness={samplePins[0]}
        city="Indore, Madhya Pradesh"
        mapMode="map"
        onMapModeChange={() => {}}
        searchInArea={true}
        onToggleSearchInArea={() => {}}
        onSelectBusiness={() => {}}
        onDrawAreaClick={() => {}}
      />
    );

    expect(screen.getByTestId("live-slippy-map")).toBeDefined();
    expect(screen.getByText("Spice Junction")).toBeDefined();
    expect(screen.getByText(/Live Map Tiles/i)).toBeDefined();
  });
});

