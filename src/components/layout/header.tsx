// import { UserButton } from "@/components/auth/user-button"; 
// Note: We haven't created UserButton yet, so I'll create a placeholder or just basic text for now
// Actually, let's just use a simple placeholder
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="ml-auto flex items-center space-x-4">
          {/* We will add UserButton later once we have Auth UI */}
          <div className="text-sm text-muted-foreground">Admin User</div>
        </div>
      </div>
    </div>
  );
}
