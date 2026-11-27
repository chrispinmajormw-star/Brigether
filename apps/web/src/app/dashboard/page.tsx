import React from 'react';
import Link from 'next/link';
import { Card, Button } from '../../../../packages/ui/src';
import { t } from '../../lib/strings';

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col bg-gray-50 p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-teal">{t('dashboard')}</h1>
        <Link href="/meeting/create" className="btn-gold">
          {t('createMeeting')}
        </Link>
      </header>
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder card – replace with meeting list from API */}
        <Card className="text-center">
          <p className="text-gray-600">{t('noMeetingsYet')}</p>
          <Button variant="gold" className="mt-4" as="a" href="/meeting/create">
            {t('createMeeting')}
          </Button>
        </Card>
      </section>
    </main>
  );
}
