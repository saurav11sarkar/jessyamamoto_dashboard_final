<<<<<<< HEAD
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
=======
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
>>>>>>> 79a49893f3350348e27d75e90810cf3dbf4fa01a
