import { Input } from "@/ui/input"
import { Label } from "@/ui/label"

export default function CustomInput() {
  const id = null;
  return (
    <div className="*:not-first:mt-2">
      <Label htmlFor={id}>
        Required input <span className="text-destructive">*</span>
      </Label>
      <Input id={id} placeholder="Email" type="email" required />
            <p
        className="text-muted-foreground mt-2 text-xs"
        role="region"
        aria-live="polite"
      >
        We won&lsquo;t share your email with anyone
      </p>
    </div>
  )
}

