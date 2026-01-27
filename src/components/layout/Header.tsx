import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SITE_NAME } from "@/lib/constants";
import { useAuth } from "@/lib/auth";
import logoImage from "@/assets/logo.png";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/carros", label: "Veículos" },
  { href: "/marcas", label: "Marcas" },
];

// Get initials from email
const getInitials = (email: string) => {
  const name = email.split("@")[0];
  const parts = name.split(/[._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLoginClick = () => {
    if (user) {
      if (role === "super_admin") {
        navigate("/admin/dashboard");
      } else if (role === "garage") {
        navigate("/garage/dashboard");
      }
    } else {
      navigate("/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border/30">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img 
            src={logoImage} 
            alt={SITE_NAME} 
            className="h-12 w-12 rounded-xl object-contain"
          />
          <span className="font-display text-xl font-bold text-foreground">
            {SITE_NAME}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive(link.href) ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <button
              onClick={handleLoginClick}
              className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-full border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {getInitials(user.email || "")}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground">Painel</span>
            </button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex items-center gap-2 border-border/50 hover:border-primary/50 hover:bg-primary/5"
              onClick={handleLoginClick}
            >
              <User className="h-4 w-4" />
              Entrar
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-border/30 animate-fade-in bg-background/95 backdrop-blur-xl">
          <nav className="container py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-card"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <button
              className="mt-2 w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border/50 hover:bg-card transition-colors"
              onClick={() => {
                setIsMenuOpen(false);
                handleLoginClick();
              }}
            >
              {user ? (
                <>
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {getInitials(user.email || "")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">Painel</span>
                </>
              ) : (
                <>
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">Entrar</span>
                </>
              )}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
