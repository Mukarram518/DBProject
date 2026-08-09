import { createFileRoute } from "@tanstack/react-router";

import { CategoryForm } from "@/components/admin/category-form";
import { PageHeader } from "@/components/admin/page-header";

export const Route = createFileRoute("/categories/new")({
  head: () => ({
    meta: [
      { title: "Add Category | E-Commerce Management System" },
      { name: "description", content: "Create a new product category with a short description." },
      { property: "og:title", content: "Add Category | E-Commerce Management System" },
      { property: "og:description", content: "Create a new product category." },
    ],
  }),
  component: AddCategoryPage,
});

function AddCategoryPage() {
  return (
    <>
      <PageHeader
        title="Add Category"
        description="Group related products under a new category."
        backTo="/categories"
        backLabel="Back to Categories"
      />
      <CategoryForm />
    </>
  );
}
