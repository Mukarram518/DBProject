import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";

export const Route = createFileRoute("/products/new")({
  head: () => ({
    meta: [
      { title: "Add Product | E-Commerce Management System" },
      {
        name: "description",
        content: "Add a new product with category, price, stock quantity and description.",
      },
      { property: "og:title", content: "Add Product | E-Commerce Management System" },
      { property: "og:description", content: "Add a new product to the catalog." },
    ],
  }),
  component: AddProductPage,
});

function AddProductPage() {
  return (
    <>
      <PageHeader
        title="Add Product"
        description="Create a catalog entry for a new product."
        backTo="/products"
        backLabel="Back to Products"
      />
      <ProductForm />
    </>
  );
}
