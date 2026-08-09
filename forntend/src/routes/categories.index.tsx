import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/page-header";
import { TableToolbar } from "@/components/admin/table-toolbar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { padId } from "@/data/selectors";
import { useStore } from "@/data/store";

export const Route = createFileRoute("/categories/")({
  head: () => ({
    meta: [
      { title: "Categories | E-Commerce Management System" },
      {
        name: "description",
        content: "Manage product categories and see how many products sit in each one.",
      },
      { property: "og:title", content: "Categories | E-Commerce Management System" },
      { property: "og:description", content: "Manage product categories and their counts." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { categories, products, deleteCategory } = useStore();
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return categories
      .filter((c) => !q || c.name.toLowerCase().includes(q))
      .map((c) => ({
        ...c,
        count: products.filter((p) => p.categoryId === c.id).length,
      }));
  }, [categories, products, search]);

  return (
    <>
      <PageHeader
        title="Categories"
        description={`${categories.length} categories in the catalog.`}
        action={
          <Button asChild>
            <Link to="/categories/new">
              <Plus className="size-4" />
              Add Category
            </Link>
          </Button>
        }
      />

      <div className="card-surface overflow-hidden">
        <TableToolbar search={search} onSearch={setSearch} placeholder="Search category..." />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Category Name</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead className="text-right">Products</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {padId(category.id)}
                </TableCell>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="hidden max-w-md truncate text-muted-foreground md:table-cell">
                  {category.description}
                </TableCell>
                <TableCell className="text-right">{category.count}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="sm">
                      <Link
                        to="/categories/$categoryId/edit"
                        params={{ categoryId: String(category.id) }}
                      >
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        deleteCategory(category.id);
                        toast.success(`Deleted ${category.name}`);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No categories found.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
