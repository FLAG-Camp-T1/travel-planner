import { APIProvider } from '@vis.gl/react-google-maps';
import type { ReactNode } from 'react';
import DebugRoutePanel from '@/components/map/DebugRoutePanel';

type TripPlanMapShellProps = {
  apiKey: string;
  children: ReactNode;
};

export default function TripPlanMapShell({ apiKey, children }: TripPlanMapShellProps) {
  // The map shell owns the map runtime boundary for the planning workspace.
  return (
    <APIProvider apiKey={apiKey}>
      {import.meta.env.DEV ? <DebugRoutePanel /> : null}
      {children}
    </APIProvider>
  );
}
