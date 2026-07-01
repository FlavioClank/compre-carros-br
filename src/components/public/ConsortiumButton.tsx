import { useState, useEffect } from "react";
import { supabase, getSupabaseUrl } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Handshake } from "lucide-react";
import { generateWhatsAppUrl } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

interface ConsortiumButtonProps {
  vehicleInfo: string;
  vehicleId?: string;
}

function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned.charAt(i)) * (10 - i);
  let check = 11 - (sum % 11);
  if (check >= 10) check = 0;
  if (parseInt(cleaned.charAt(9)) !== check) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned.charAt(i)) * (11 - i);
  check = 11 - (sum % 11);
  if (check >= 10) check = 0;
  return parseInt(cleaned.charAt(10)) === check;
}

function formatCPF(value: string): string {
  const cleaned = value.replace(/\D/g, "").slice(0, 11);
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
  if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
}

function formatPhone(value: string): string {
  const cleaned = value.replace(/\D/g, "").slice(0, 11);
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
}

export function ConsortiumButton({ vehicleInfo, vehicleId }: ConsortiumButtonProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<{ is_enabled: boolean; whatsapp_number: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    supabase
      .from("consortium_settings")
      .select("is_enabled, whatsapp_number")
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setSettings(data as { is_enabled: boolean; whatsapp_number: string });
      });
  }, []);

  if (!settings?.is_enabled || !settings?.whatsapp_number) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Nome é obrigatório";
    if (!birthDate) newErrors.birthDate = "Data de nascimento é obrigatória";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Email inválido";
    if (!validateCPF(cpf)) newErrors.cpf = "CPF inválido";
    const phoneClean = phone.replace(/\D/g, "");
    if (phoneClean.length < 10 || phoneClean.length > 11)
      newErrors.phone = "Celular inválido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast({
        title: "Preencha as informações obrigatórias",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Submit through the edge function (server-side validation + service-role insert).
    let waUrl: string | null = null;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      const res = await fetch(
        `${getSupabaseUrl()}/functions/v1/submit-consortium-lead`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({
            name: name.trim(),
            birth_date: birthDate,
            email: email.trim(),
            cpf: cpf.replace(/\D/g, ""),
            phone: phone.replace(/\D/g, ""),
            vehicle_info: vehicleInfo,
            vehicle_id: vehicleId || null,
          }),
        },
      );

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        setIsSubmitting(false);
        toast({
          title: "Erro ao enviar",
          description:
            errBody?.error === "rate_limited"
              ? "Muitas tentativas. Aguarde um instante e tente novamente."
              : "Não foi possível enviar seus dados. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      const body = (await res.json()) as { url?: string | null };
      waUrl = body.url ?? null;
    } catch {
      setIsSubmitting(false);
      toast({
        title: "Erro ao enviar",
        description: "Falha de conexão. Tente novamente.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(false);

    // Open WhatsApp using the URL built by the server, or fallback client-side.
    const fallbackMessage = `Olá! Vim através do site CompreCarrosBr e tenho interesse em fazer um *consórcio*.\n\n📋 *Meus dados:*\nNome: ${name.trim()}\nEmail: ${email.trim()}\nCelular: ${phone}\n\n🚗 *Veículo de interesse:*\n${vehicleInfo}\n\nPoderia me passar mais informações?`;
    const finalUrl =
      waUrl || generateWhatsAppUrl(settings.whatsapp_number, fallbackMessage);
    window.open(finalUrl, "_blank");
    setIsOpen(false);

    // Reset form
    setName("");
    setBirthDate("");
    setEmail("");
    setCpf("");
    setPhone("");
    setErrors({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          variant="outline"
          className="w-full gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Handshake className="h-5 w-5" />
          Consórcio
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Handshake className="h-5 w-5" />
            Interesse em Consórcio
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            Preencha seus dados para ser redirecionado ao WhatsApp do nosso parceiro de consórcio.
          </p>
          <div className="space-y-1">
            <Label htmlFor="consortium-name">Nome *</Label>
            <Input
              id="consortium-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="consortium-birth">Data de Nascimento *</Label>
            <Input
              id="consortium-birth"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
            {errors.birthDate && <p className="text-xs text-destructive">{errors.birthDate}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="consortium-email">Email *</Label>
            <Input
              id="consortium-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="consortium-cpf">CPF *</Label>
            <Input
              id="consortium-cpf"
              value={cpf}
              onChange={(e) => setCpf(formatCPF(e.target.value))}
              placeholder="000.000.000-00"
              maxLength={14}
            />
            {errors.cpf && <p className="text-xs text-destructive">{errors.cpf}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="consortium-phone">Celular *</Label>
            <Input
              id="consortium-phone"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="(00) 00000-0000"
              maxLength={15}
            />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Enviar e ir para o WhatsApp"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
