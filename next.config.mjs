/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        NEXT_PUBLIC_BACKEND_API_URL:
            process.env.NEXT_PUBLIC_BACKEND_API_URL || "https://api.jetsetcares.org/api/v1",
    },
    images:{
        domains:["res.cloudinary.com"]
    }
};

export default nextConfig;
