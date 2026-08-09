import { createFileRoute } from "@tanstack/react-router";
import { Star, Trash2 } from "lucide-react";
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
import { formatDate, padId, productName, userName } from "@/data/selectors";
import { useStore } from "@/data/store";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews | E-Commerce Management System" },
      {
        name: "description",
        content: "Moderate customer product reviews, filter by rating and remove bad entries.",
      },
      { property: "og:title", content: "Reviews | E-Commerce Management System" },
      { property: "og:description", content: "Moderate customer product reviews by rating." },
    ],
  }),
  component: ReviewsPage,
});

const PAGE_SIZE = 12;

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={
            value <= rating
              ? "size-3.5 fill-warning text-warning"
              : "size-3.5 text-muted-foreground/40"
          }
        />
      ))}
    </span>
  );
}

function ReviewsPage() {
  const { reviews, products, users, deleteReview } = useStore();
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("all");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reviews
      .map((review) => ({
        ...review,
        product: productName(products, review.productId),
        customer: userName(users, review.userId),
      }))
      .filter((review) => {
        const matchesQuery =
          !q ||
          review.product.toLowerCase().includes(q) ||
          review.customer.toLowerCase().includes(q);
        const matchesRating = rating === "all" || review.rating === Number(rating);
        return matchesQuery && matchesRating;
      });
  }, [reviews, products, users, search, rating]);

  const pageCount = Math.ceil(rows.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(pageCount, 1));
  const visible = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const average = rows.length
    ? (rows.reduce((sum, r) => sum + r.rating, 0) / rows.length).toFixed(2)
    : "0.00";

  return (
    <>
      <PageHeader
        title="Reviews"
        description={`${rows.length} reviews · average rating ${average} / 5.`}
      />

      <div className="card-surface overflow-hidden">
        <TableToolbar
          search={search}
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search product or customer..."
        >
          <Select
            value={rating}
            onValueChange={(value) => {
              setRating(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ratings</SelectItem>
              <SelectItem value="5">5 stars</SelectItem>
              <SelectItem value="4">4 stars</SelectItem>
              <SelectItem value="3">3 stars</SelectItem>
              <SelectItem value="2">2 stars</SelectItem>
              <SelectItem value="1">1 star</SelectItem>
            </SelectContent>
          </Select>
        </TableToolbar>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">ID</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((review) => (
              <TableRow key={review.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  R{padId(review.id)}
                </TableCell>
                <TableCell className="font-medium">{review.product}</TableCell>
                <TableCell>{review.customer}</TableCell>
                <TableCell>
                  <Stars rating={review.rating} />
                </TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">
                  {review.comment}
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(review.date)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      deleteReview(review.id);
                      toast.success("Review deleted");
                    }}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No reviews match your filters.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>

        <PaginationBar
          page={currentPage}
          pageCount={pageCount}
          total={rows.length}
          pageSize={PAGE_SIZE}
          onPage={setPage}
        />
      </div>
    </>
  );
}
