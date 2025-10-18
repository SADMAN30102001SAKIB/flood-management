import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }
  
  // Redirect based on role
  const role = session.user.role;
  
  if (role === 'admin') {
    redirect('/dashboard/admin');
  } else if (role === 'volunteer') {
    redirect('/dashboard/volunteer');
  } else if (role === 'emergency_volunteer') {
    redirect('/dashboard/emergency');
  } else {
    redirect('/dashboard/user');
  }
}
