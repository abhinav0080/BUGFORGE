import BugForge from './application';
import { getChatGPTUser } from './chatgpt-auth';
export const dynamic = 'force-dynamic';
export default async function Home() {
 const user = await getChatGPTUser();
 return <BugForge user={user ? { name: user.fullName || 'Researcher', email: user.email } : null} />;
}
