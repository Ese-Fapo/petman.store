'use client'
import CategoryDirectory from "@/components/CategoryDirectory";
import BestSelling from "@/components/BestSelling";
import Hero from "@/components/Hero";
import Newsletter from "@/components/Newsletter";
import OurSpecs from "@/components/OurSpec";
import LatestProducts from "@/components/LatestProducts";

export default function Home() {
    return (
        <div>
            {/* Public homepage sections shown in browsing order. */}
            <Hero />
            <CategoryDirectory />
            <LatestProducts />
            <BestSelling />
            <OurSpecs />
            <Newsletter />
        </div>
    );
}
