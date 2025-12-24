import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Car, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/constants";
import { useAuth } from "@/lib/auth";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/carros", label: "Veículos" },
  { href: "/marcas", label: "Marcas" },
];

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
    <header className="sticky top-0 z-50 w-full glass border-b border-border/50">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Car className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-primary">
            {SITE_NAME}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium transition-colors hover:text-accent ${
                isActive(link.href)
                  ? "text-accent"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex items-center gap-2"
            onClick={handleLoginClick}
          >
            <User className="h-4 w-4" />
            {user ? "Painel" : "Entrar"}
          </Button>

          {/* Mobile Menu Button */}
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

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border animate-fade-in">
          <nav className="container py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Button
              variant="outline"
              className="mt-2 w-full flex items-center gap-2"
              onClick={() => {
                setIsMenuOpen(false);
                handleLoginClick();
              }}
            >
              <User className="h-4 w-4" />
              {user ? "Painel" : "Entrar"}
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
