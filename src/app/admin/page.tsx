import { redirect } from 'next/navigation';
import { getAdminSessionFromCookies } from '@/lib/adminAuth';
import AdminPortal from '@/components/AdminPortal';

export default async function AdminPage() {
  const session = await getAdminSessionFromCookies();

  if (!session) {
    redirect('/admin/login');
  }

  return <AdminPortal adminUser={session.sub} />;
}
