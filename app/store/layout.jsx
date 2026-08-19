import StoreLayout from "@/components/store/StoreLayout";

export const metadata = {
    title: "JUSTPETS - Store Dashboard",
    description: "JUSTPETS store dashboard",
};

export default function RootStoreLayout({ children }) {

    return (
        <>
            <StoreLayout>
                {children}
            </StoreLayout>
        </>
    );
}
