import { NavLink } from "./NavLink";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import WalletButton from "./WalletButton";
import { useWallet } from "@/contexts/WalletContext";

const Navigation = () => {
  const { isConnected } = useWallet();
  
  const links = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/explore", label: "Explore" },
    { to: "/fractionalize", label: "Fractionalize" },
    { to: "/widget", label: "Widget" },
    { to: "/ip-enforcement", label: "IP Enforcement" },
  ];

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">IP</span>
            </div>
            <span className="font-bold text-xl text-foreground">IP-Fi Swap</span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {isConnected && links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="text-muted-foreground hover:text-foreground transition-colors"
                activeClassName="text-primary font-medium"
              >
                {link.label}
              </NavLink>
            ))}
            <WalletButton />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">
            <WalletButton />
            {isConnected && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="flex flex-col gap-4 mt-8">
                    {links.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        className="text-muted-foreground hover:text-foreground transition-colors text-lg"
                        activeClassName="text-primary font-medium"
                      >
                        {link.label}
                      </NavLink>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
