import StoreLayout from "@/components/store/StoreLayout";

export const metadata = {
    title: "shopSmart - Store Dashboard",
    description: "shopSmart store dashboard",
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
