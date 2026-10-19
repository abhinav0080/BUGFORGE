import BugForge from './application';
import { getSessionUser } from './session-auth';
export const dynamic = 'force-dynamic';
export default async function Home() {
 const user = await getSessionUser();
 return <BugForge user={user ? { name: user.fullName || 'Researcher', email: user.email } : null} />;
}
