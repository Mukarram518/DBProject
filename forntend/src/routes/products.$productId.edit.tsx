import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { useStore } from "@/data/store";

export const Route = createFileRoute("/products/$productId/edit")({
  head: () => ({
    meta: [
      { title: "Edit Product | E-Commerce Management System" },
      { name: "description", content: "Update product pricing, stock level and description." },
      { property: "og:title", content: "Edit Product | E-Commerce Management System" },
      { property: "og:description", content: "Update product pricing and stock." },
    ],
  }),
  component: EditProductPage,
});

function EditProductPage() {
  const { productId } = Route.useParams();
  const { products } = useStore();
  const product = products.find((p) => p.id === Number(productId));

  return (
    <>
      <PageHeader
        title={product ? `Edit ${product.name}` : "Edit Product"}
        description="Update the product details below."
        backTo="/products"
        backLabel="Back to Products"
      />
      {product ? (
        <ProductForm product={product} />
      ) : (
        <div className="card-surface p-10 text-center text-muted-foreground">
          This product no longer exists.
        </div>
      )}
    </>
  );
}
