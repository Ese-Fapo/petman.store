import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "JUSTPETS - Admin",
    description: "JUSTPETS admin dashboard",
};

export default function RootAdminLayout({ children }) {

    return (
        <AdminLayout>
            {children}
        </AdminLayout>
    );
}
