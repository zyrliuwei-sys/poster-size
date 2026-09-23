import { createFileRoute } from '@tanstack/react-router';

import { roomLandingRouteOptions } from './-room-landing';

export const Route = createFileRoute('/(rooms)/ai-bedroom-design')(
  roomLandingRouteOptions('bedroom')
);
