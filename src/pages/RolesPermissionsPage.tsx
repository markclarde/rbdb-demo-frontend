import * as React from "react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";

const roleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
});

type RoleFormValues = z.infer<typeof roleSchema>;

const permissionSchema = z.object({
  name: z.string().min(1, "Permission name is required"),
  description: z.string().min(1, "Description is required"),
});

type PermissionFormValues = z.infer<typeof permissionSchema>;

export function RolesPermissionsPage() {
  const { can } = useAuth();

  const roleForm = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: "" },
  });

  const permForm = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionSchema),
    defaultValues: { name: "", description: "" },
  });

  // 🔐 Page-level protection
  if (!can("ROLE_READ")) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Roles & Permissions"
          description="You do not have access to this page."
        />
        <Card className="border-border/70">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Required permission:{" "}
            <span className="font-mono">
              ROLE_VIEW
            </span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description="Create roles and permissions."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Create Role */}
        <Card className="border-border/70">
          <CardContent className="pt-6">
            <div className="text-sm font-semibold tracking-tight">
              Create role
            </div>
            <Separator className="my-4" />

            <form
              className="space-y-4"
              onSubmit={roleForm.handleSubmit(async (values) => {
                try {
                  // await rolesApi.create(values);
                  toast.success(`Role created: ${values.name}`);
                  roleForm.reset();
                } catch (err: any) {
                  toast.error(
                    err?.response?.data?.message ||
                      "Failed to create role"
                  );
                }
              })}
            >
              <div className="space-y-2">
                <Label htmlFor="roleName">Role name</Label>
                <Input
                  id="roleName"
                  {...roleForm.register("name")}
                  placeholder="e.g. finance_manager"
                />
                {roleForm.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {roleForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={roleForm.formState.isSubmitting}
                >
                  {roleForm.formState.isSubmitting
                    ? "Creating…"
                    : "Create role"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Create Permission */}
        <Card className="border-border/70">
          <CardContent className="pt-6">
            <div className="text-sm font-semibold tracking-tight">
              Create permission
            </div>
            <Separator className="my-4" />

            <form
              className="space-y-4"
              onSubmit={permForm.handleSubmit(async (values) => {
                try {
                  // await permissionsApi.create(values);
                  toast.success(`Permission created: ${values.name}`);
                  permForm.reset();
                } catch (err: any) {
                  toast.error(
                    err?.response?.data?.message ||
                      "Failed to create permission"
                  );
                }
              })}
            >
              <div className="space-y-2">
                <Label htmlFor="permName">Name</Label>
                <Input
                  id="permName"
                  {...permForm.register("name")}
                  placeholder="e.g. approve_quotation"
                />
                {permForm.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {permForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="permDesc">Description</Label>
                <Input
                  id="permDesc"
                  {...permForm.register("description")}
                  placeholder="What does this permission allow?"
                />
                {permForm.formState.errors.description && (
                  <p className="text-sm text-destructive">
                    {permForm.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={permForm.formState.isSubmitting}
                >
                  {permForm.formState.isSubmitting
                    ? "Creating…"
                    : "Create permission"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
