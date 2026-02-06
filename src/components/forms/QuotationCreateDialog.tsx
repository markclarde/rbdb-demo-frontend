import * as React from "react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
// import { quotationsApi } from "@/api/quotations"; // Uncomment when ready

const schema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
});

type FormValues = z.infer<typeof schema>;

export function QuotationCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { can } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { clientName: "", amount: 0 },
  });

  const canCreate = can("QUOTATION_CREATE");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Create quotation</DialogTitle>
          <DialogDescription>
            Create a new quotation.
          </DialogDescription>
        </DialogHeader>

        {!canCreate ? (
          <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
            You don’t have permission to create quotations.
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              try {
                // Replace this with real API call when ready:
                // await quotationsApi.create(values);

                toast.success(`Quotation created for ${values.clientName}`);
                onOpenChange(false);
                form.reset();
              } catch (err: any) {
                toast.error(
                  err?.response?.data?.message || "Failed to create quotation"
                );
              }
            })}
          >
            <div className="space-y-2">
              <Label htmlFor="clientName">Client name</Label>
              <Input
                id="clientName"
                {...form.register("clientName")}
                placeholder="Acme Corp"
              />
              {form.formState.errors.clientName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.clientName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                inputMode="decimal"
                {...form.register("amount")}
                placeholder="12500"
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Creating…"
                  : "Create quotation"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
