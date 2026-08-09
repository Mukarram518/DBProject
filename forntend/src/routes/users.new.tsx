import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/admin/page-header";
import { UserForm } from "@/components/admin/user-form";

export const Route = createFileRoute("/users/new")({
  head: () => ({
    meta: [
      { title: "Add New User | E-Commerce Management System" },
      {
        name: "description",
        content: "Create a new customer or staff account with role and status.",
      },
      { property: "og:title", content: "Add New User | E-Commerce Management System" },
      { property: "og:description", content: "Create a new account with role and status." },
    ],
  }),
  component: AddUserPage,
});

function AddUserPage() {
  return (
    <>
      <PageHeader
        title="Add New User"
        description="Fill in the details to create an account."
        backTo="/users"
        backLabel="Back to Users"
      />
      <UserForm />
    </>
  );
}
