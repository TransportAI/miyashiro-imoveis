import React from 'react';
import HomeInteractiveView from '@/components/HomeInteractiveView';
import { getProperties } from '@/lib/properties';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const properties = getProperties();

  return <HomeInteractiveView initialProperties={properties} />;
}
