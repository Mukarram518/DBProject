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
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/data/store";
import type { Product } from "@/data/types";

const schema = z.object({
  name: z.string().trim().min(2, "Enter a product name").max(120),
  categoryId: z.string().min(1, "Select a category"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0").max(1000000),
  stock: z.coerce.number().int("Whole numbers only").min(0, "Cannot be negative").max(100000),
  description: z.string().trim().max(1000, "Keep it under 1000 characters"),
});

type FormValues = z.input<typeof schema>;

export function ProductForm({ product }: { product?: Product }) {
  const { categories, addProduct, updateProduct } = useStore();
  const navigate = useNavigate();
  const isEdit = Boolean(product);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name ?? "",
      categoryId: product ? String(product.categoryId) : "",
      price: product?.price ?? ("" as unknown as number),
      stock: product?.stock ?? ("" as unknown as number),
      description: product?.description ?? "",
    },
  });

  const onSubmit = (raw: FormValues) => {
    const values = schema.parse(raw);
    const payload = {
      name: values.name,
      categoryId: Number(values.categoryId),
      price: values.price,
      stock: values.stock,
      description: values.description,
    };
    if (product) {
      updateProduct(product.id, payload);
      toast.success(`Updated ${values.name}`);
    } else {
      addProduct(payload);
      toast.success(`Added ${values.name}`);
    }
    navigate({ to: "/products" });
  };

  return (
    <div className="card-surface p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="Wireless Mouse" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" placeholder="25.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea rows={5} placeholder="Short product description..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate({ to: "/products" })}>
              Cancel
            </Button>
            <Button type="submit">{isEdit ? "Save Changes" : "Save Product"}</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
