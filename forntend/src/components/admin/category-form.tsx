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
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/data/store";
import type { Category } from "@/data/types";

const schema = z.object({
  name: z.string().trim().min(2, "Enter a category name").max(60),
  description: z.string().trim().max(500, "Keep it under 500 characters"),
});

type FormValues = z.infer<typeof schema>;

export function CategoryForm({ category }: { category?: Category }) {
  const { addCategory, updateCategory } = useStore();
  const navigate = useNavigate();
  const isEdit = Boolean(category);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: category?.name ?? "",
      description: category?.description ?? "",
    },
  });

  const onSubmit = (values: FormValues) => {
    if (category) {
      updateCategory(category.id, values);
      toast.success(`Updated ${values.name}`);
    } else {
      addCategory(values);
      toast.success(`Created ${values.name}`);
    }
    navigate({ to: "/categories" });
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="card-surface p-6">
        <h3 className="mb-6 text-center text-sm font-semibold tracking-widest uppercase">
          {isEdit ? "Edit Category" : "Create Category"}
        </h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Electronics" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={5} placeholder="What belongs in this category..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/categories" })}
              >
                Cancel
              </Button>
              <Button type="submit">{isEdit ? "Save Changes" : "Create Category"}</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
