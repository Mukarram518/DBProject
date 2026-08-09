import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/page-header";
import { PaginationBar } from "@/components/admin/pagination-bar";
import { TableToolbar } from "@/components/admin/table-toolbar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { currencyPrecise, padId } from "@/data/selectors";
import { useStore } from "@/data/store";

export const Route = createFileRoute("/products/")({
  head: () => ({
    meta: [
      { title: "Products | E-Commerce Management System" },
      {
        name: "description",
        content: "Catalog of products with category, price, stock levels and quick edit actions.",
      },
      { property: "og:title", content: "Products | E-Commerce Management System" },
      { property: "og:description", content: "Catalog of products with price and stock levels." },
    ],
  }),
  component: ProductsPage,
});

const PAGE_SIZE = 10;

function ProductsPage() {
  const { products, categories, deleteProduct } = useStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stock, setStock] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const categoryName = (id: number) => categories.find((c) => c.id === id)?.name ?? "—";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = products.filter((product) => {
      const matchesQuery = !q || product.name.toLowerCase().includes(q);
      const matchesCategory = category === "all" || product.categoryId === Number(category);
      const matchesStock =
        stock === "all" ||
        (stock === "out" && product.stock === 0) ||
        (stock === "low" && product.stock > 0 && product.stock <= 20) ||
        (stock === "in" && product.stock > 20);
      return matchesQuery && matchesCategory && matchesStock;
    });

    const sorted = [...rows];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "stock") sorted.sort((a, b) => a.stock - b.stock);
    else sorted.sort((a, b) => b.id - a.id);
    return sorted;
  }, [products, search, category, stock, sort]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(pageCount, 1));
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const reset = (fn: (value: string) => void) => (value: string) => {
    fn(value);
    setPage(1);
  };

  return (
    <>
      <PageHeader
        title="Products"
        description={`${products.length} products across ${categories.length} categories.`}
        action={
          <Button asChild>
            <Link to="/products/new">
              <Plus className="size-4" />
              Add Product
            </Link>
          </Button>
        }
      />

      <div className="card-surface overflow-hidden">
        <TableToolbar search={search} onSearch={reset(setSearch)} placeholder="Search products...">
          <Select value={category} onValueChange={reset(setCategory)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stock} onValueChange={reset(setStock)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stock</SelectItem>
              <SelectItem value="in">In stock</SelectItem>
              <SelectItem value="low">Low (≤ 20)</SelectItem>
              <SelectItem value="out">Out of stock</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={reset(setSort)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="name">Name A–Z</SelectItem>
              <SelectItem value="price-asc">Price low to high</SelectItem>
              <SelectItem value="price-desc">Price high to low</SelectItem>
              <SelectItem value="stock">Lowest stock</SelectItem>
            </SelectContent>
          </Select>
        </TableToolbar>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {padId(product.id)}
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {categoryName(product.categoryId)}
                </TableCell>
                <TableCell className="text-right">{currencyPrecise(product.price)}</TableCell>
                <TableCell className="text-right">
                  {product.stock === 0 ? (
                    <span className="font-medium text-destructive">Out of stock</span>
                  ) : product.stock <= 20 ? (
                    <span className="font-medium text-warning">{product.stock}</span>
                  ) : (
                    product.stock
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/products/$productId/edit" params={{ productId: String(product.id) }}>
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        deleteProduct(product.id);
                        toast.success(`Deleted ${product.name}`);
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
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No products match your filters.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>

        <PaginationBar
          page={currentPage}
          pageCount={pageCount}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          onPage={setPage}
        />
      </div>
    </>
  );
}
