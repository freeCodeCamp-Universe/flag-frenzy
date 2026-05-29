import { Suspense } from 'react';

import { PlayPage } from './PlayPage';

export default function PlayRoute() {
  return (
    <Suspense>
      <PlayPage />
    </Suspense>
  );
}
