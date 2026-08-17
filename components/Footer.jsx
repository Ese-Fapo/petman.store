import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Store, Twitter } from "lucide-react";
import Link from "next/link";

const Footer = () => {

    const linkSections = [
        {
            title: "PRODUCTS",
            links: [
                { text: "Dog Food", path: '/shop' },
                { text: "Cat Food", path: '/shop' },
                { text: "Pet Toys", path: '/shop' },
                { text: "Small Pets", path: '/shop' },
            ]
        },
        {
            title: "JUSTPETS",
            links: [
                { text: "Home", path: '/' },
                { text: "Privacy Policy", path: '/' },
                { text: "Pet Care Club", path: '/pricing' },
                { text: "Visit Our Shop", path: '/shop' },
            ]
        },
        {
            title: "CONTACT",
            links: [
                { text: "+353 1 555 0198", path: '/', icon: Phone },
                { text: "hello@justpets.ie", path: '/', icon: Mail },
                { text: "24 Pet Lane, Dublin 2, Ireland", path: '/', icon: MapPin }
            ]
        }
    ];

    const socialIcons = [
        { icon: Facebook, link: "https://www.facebook.com" },
        { icon: Instagram, link: "https://www.instagram.com" },
        { icon: Twitter, link: "https://twitter.com" },
        { icon: Linkedin, link: "https://www.linkedin.com" },
    ]

    return (
        <footer className="mx-6 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-start justify-between gap-10 py-10 border-b border-slate-500/30 text-slate-500">
                    <div>
                        <Link href="/" className="text-4xl font-semibold text-slate-800">
                            JUST<span className="text-green-600">PETS</span><span className="text-green-600 text-5xl leading-0">.</span>
                        </Link>
                        <p className="max-w-[410px] mt-6 text-sm">Welcome to JUSTPETS, an Ireland-based pet shop for food, toys, bowls, treats, and care essentials for the pets who make the house feel like home.</p>
                        <Link href="/create-store" className="mt-5 inline-flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600">
                            <Store size={16} />
                            Create Your Own Shop
                        </Link>
                        <div className="flex items-center gap-3 mt-5">
                            {socialIcons.map((item, i) => (
                                <Link href={item.link} key={i} className="flex items-center justify-center w-10 h-10 bg-slate-100 hover:scale-105 hover:border border-slate-300 transition rounded-full">
                                    <item.icon size={20} className="text-slate-500" />
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-between w-full md:w-[45%] gap-5 text-sm ">
                        {linkSections.map((section, index) => (
                            <div key={index}>
                                <h3 className="font-medium text-slate-700 md:mb-5 mb-3">{section.title}</h3>
                                <ul className="space-y-2.5">
                                    {section.links.map((link, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            {link.icon && <link.icon size={16} className="text-slate-400" />}
                                            <Link href={link.path} className="hover:underline transition">{link.text}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
                <p className="py-4 text-sm text-slate-500">
                    Copyright 2026 © JUSTPETS. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
