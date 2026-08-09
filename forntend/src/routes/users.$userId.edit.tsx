import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/admin/page-header";
import { UserForm } from "@/components/admin/user-form";
import { useStore } from "@/data/store";

export const Route = createFileRoute("/users/$userId/edit")({
  head: () => ({
    meta: [
      { title: "Edit User | E-Commerce Management System" },
      { name: "description", content: "Update account details, role and status for a user." },
      { property: "og:title", content: "Edit User | E-Commerce Management System" },
      { property: "og:description", content: "Update account details, role and status." },
    ],
  }),
  component: EditUserPage,
});

function EditUserPage() {
  const { userId } = Route.useParams();
  const { users } = useStore();
  const user = users.find((u) => u.id === Number(userId));

  return (
    <>
      <PageHeader
        title={user ? `Edit ${user.name}` : "Edit User"}
        description="Update the account details below."
        backTo="/users"
        backLabel="Back to Users"
      />
      {user ? (
        <UserForm user={user} />
      ) : (
        <div className="card-surface p-10 text-center text-muted-foreground">
          This user no longer exists.
        </div>
      )}
    </>
  );
}
