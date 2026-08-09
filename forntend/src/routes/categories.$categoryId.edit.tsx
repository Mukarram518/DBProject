import { createFileRoute } from "@tanstack/react-router";

import { CategoryForm } from "@/components/admin/category-form";
import { PageHeader } from "@/components/admin/page-header";
import { useStore } from "@/data/store";

export const Route = createFileRoute("/categories/$categoryId/edit")({
  head: () => ({
    meta: [
      { title: "Edit Category | E-Commerce Management System" },
      { name: "description", content: "Rename a category or update its description." },
      { property: "og:title", content: "Edit Category | E-Commerce Management System" },
      { property: "og:description", content: "Rename a category or update its description." },
    ],
  }),
  component: EditCategoryPage,
});

function EditCategoryPage() {
  const { categoryId } = Route.useParams();
  const { categories } = useStore();
  const category = categories.find((c) => c.id === Number(categoryId));

  return (
    <>
      <PageHeader
        title={category ? `Edit ${category.name}` : "Edit Category"}
        description="Update the category details below."
        backTo="/categories"
        backLabel="Back to Categories"
      />
      {category ? (
        <CategoryForm category={category} />
      ) : (
        <div className="card-surface p-10 text-center text-muted-foreground">
          This category no longer exists.
        </div>
      )}
    </>
  );
}
