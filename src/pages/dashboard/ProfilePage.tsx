import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="bg-card rounded-xl p-4 sm:p-6 shadow-sm">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Profile Information</h2>
      
      <form className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center">
            <span className="text-2xl font-bold text-accent">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <Button variant="outline" size="sm">Change Photo</Button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" className="mt-1.5" placeholder="John" />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" className="mt-1.5" placeholder="Doe" />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            className="mt-1.5" 
            value={user?.email || ''} 
            disabled 
          />
          <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
        </div>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" type="tel" className="mt-1.5" placeholder="+1 (555) 123-4567" />
        </div>

        <Button className="btn-accent">Save Changes</Button>
      </form>
    </div>
  );
}
