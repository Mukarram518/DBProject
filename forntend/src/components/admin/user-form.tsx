import { useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/data/store";
import type { User } from "@/data/types";

const schema = z.object({
  name: z.string().trim().min(2, "Enter the full name").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "Digits and + - ( ) only"),
  password: z.string().min(6, "At least 6 characters").max(72).or(z.literal("")),
  role: z.enum(["Admin", "Manager", "User"]),
  status: z.enum(["Active", "Inactive"]),
});

type FormValues = z.infer<typeof schema>;

export function UserForm({ user }: { user?: User }) {
  const { addUser, updateUser } = useStore();
  const navigate = useNavigate();
  const isEdit = Boolean(user);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      password: "",
      role: user?.role ?? "User",
      status: user?.status ?? "Active",
    },
  });

  const onSubmit = (values: FormValues) => {
    if (!isEdit && values.password.length < 6) {
      form.setError("password", { message: "At least 6 characters" });
      return;
    }
    if (user) {
      updateUser(user.id, {
        name: values.name,
        email: values.email,
        phone: values.phone,
        role: values.role,
        status: values.status,
      });
      toast.success(`Updated ${values.name}`);
    } else {
      addUser({
        name: values.name,
        email: values.email,
        phone: values.phone,
        role: values.role,
        status: values.status,
      });
      toast.success(`Created ${values.name}`);
    }
    navigate({ to: "/users" });
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="card-surface p-6">
        <h3 className="mb-6 text-center text-sm font-semibold tracking-widest uppercase">
          {isEdit ? "Edit User" : "Create User"}
        </h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Ali Butt" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="ali@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="03xx xxxxxxx" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isEdit ? "New Password (optional)" : "Password"}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="User">User</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate({ to: "/users" })}>
                Cancel
              </Button>
              <Button type="submit">{isEdit ? "Save Changes" : "Create User"}</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
