'use client';
import { Centered } from '@/components/Centered';
import { Door } from '@/components/Door';

export default function JoinPage() {
  return (
    <Centered>
      <h1 className="text-2xl font-extrabold text-center mb-6">Join a meeting</h1>
      <Door guest initial="join" />
    </Centered>
  );
}