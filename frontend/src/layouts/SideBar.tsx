import TripPlanSidebarShell from '@/components/trip-plan/TripPlanSidebarShell';
import CandidatePlacesSection from '@/components/trip-plan/sections/CandidatePlacesSection';
import ItinerarySection from '@/components/trip-plan/sections/ItinerarySection';
import TripDayNavigationSection from '@/components/trip-plan/sections/TripDayNavigationSection';
import TripOverviewSection from '@/components/trip-plan/sections/TripOverviewSection';

export default function SideBar() {
  return (
    <TripPlanSidebarShell>
      <TripOverviewSection />
      <TripDayNavigationSection />
      <ItinerarySection />
      <CandidatePlacesSection />
    </TripPlanSidebarShell>
  );
}
