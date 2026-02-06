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
import { usersApi } from "@/api/users";
import { CreateUserPayload } from "@/types/user";

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role_id: z.number(),
  branch_id: z.number().optional(),
});

type FormValues = CreateUserPayload;

export function UserCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { can } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role_id: 2,
      branch_id: undefined,
    },
  });

  const canCreate = can("CREATE_USER");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Create user</DialogTitle>
          <DialogDescription>
            Add a new user to your organization.
          </DialogDescription>
        </DialogHeader>

        {!canCreate ? (
          <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
            You don’t have permission to create users.
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(async (values: FormValues) => {
              try {
                await usersApi.createUser(values);
                toast.success("User created successfully");

                onOpenChange(false);
                form.reset();
                onSuccess();
              } catch (err: any) {
                toast.error(err?.response?.data?.message || "Failed to create user");
              }
            })}
          >
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" {...form.register("username")} />
              {form.formState.errors.username && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...form.register("password")} />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role_id">Role</Label>
              <select
                aria-label="Role_id"
                id="role_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.watch("role_id")}
                onChange={(e) =>
                  form.setValue("role_id", Number(e.target.value))
                }
              >
                <option value={1}>Super Admin</option>
                <option value={2}>Admin</option>
                <option value={3}>Sales Representative</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch_id">Branch (optional)</Label>
              <Input
                id="branch_id"
                type="number"
                placeholder="Branch ID"
                onChange={(e) => {
                  const value = e.target.value;
                  form.setValue(
                    "branch_id",
                    value ? Number(value) : undefined
                  );
                }}
              />
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
                {form.formState.isSubmitting ? "Creating…" : "Create user"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
