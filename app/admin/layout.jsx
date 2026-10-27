import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "shopSmart - Admin",
    description: "shopSmart admin dashboard",
};

export default function RootAdminLayout({ children }) {

    return (
        <AdminLayout>
            {children}
        </AdminLayout>
    );
}
