import type { ReactNode } from 'react';

type TripPlanWorkspaceShellProps = {
  children: ReactNode;
};

export default function TripPlanWorkspaceShell({ children }: TripPlanWorkspaceShellProps) {
  // Shells only own composition and region boundaries for the workspace.
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <div className="relative w-full h-full">{children}</div>
    </div>
  );
}
