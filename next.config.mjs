const imageKitHost = (() => {
    try {
        return process.env.IMAGEKIT_URL_ENDPOINT
            ? new URL(process.env.IMAGEKIT_URL_ENDPOINT).hostname
            : undefined
    } catch {
        return undefined
    }
})()

/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        unoptimized: true,
        remotePatterns: imageKitHost
            ? [
                {
                    protocol: 'https',
                    hostname: imageKitHost,
                },
            ]
            : [],
    }
};

export default nextConfig;
