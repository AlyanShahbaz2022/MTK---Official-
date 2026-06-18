import { logoutAction } from '@/server/actions/auth';
import { Button } from '@/components/ui/button';

/** Logout via a server action (POST, CSRF-safe). */
export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="outline" size="sm">
        Sign out
      </Button>
    </form>
  );
}
