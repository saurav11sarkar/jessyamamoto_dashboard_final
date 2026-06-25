import React from "react";
import BlogManagement from "./_components/blog-data";
import { PageHeader } from "../_components/PageHeader";

const page = () => {
  return (
    <div>
      <PageHeader />
      <BlogManagement />
    </div>
  );
};

export default page;
